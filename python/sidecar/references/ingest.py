import json
import os
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from uuid import uuid4

import grobid_tei_xml
from dotenv import load_dotenv
from grobid_client.grobid_client import GrobidClient, ServerUnavailableException
from sidecar import shared
from sidecar.config import REFERENCES_JSON_PATH, UPLOADS_DIR, logger
from sidecar.references.schemas import (
    Author,
    IngestRequest,
    IngestResponse,
    IngestStatus,
    IngestStatusResponse,
    Reference,
    ReferenceStatus,
)
from sidecar.references.storage import JsonStorage
from sidecar.typing import ResponseStatus

load_dotenv()
logger = logger.getChild(__name__)

GROBID_SERVER_URL = "https://kermitt2-grobid.hf.space"


def run_ingest(pdf_directory: Path):
    ingest = PDFIngestion(input_dir=pdf_directory)
    response = ingest.run()
    return response


def get_statuses():
    storage = JsonStorage(REFERENCES_JSON_PATH)
    status_fetcher = IngestStatusFetcher(storage=storage)
    response = status_fetcher.emit_statuses()
    return response


def get_references(args: IngestRequest):
    pdf_directory = Path(args.pdf_directory)
    ingest = PDFIngestion(input_dir=pdf_directory)
    response = ingest.create_ingest_response()
    return response


class PDFIngestion:
    def __init__(self, input_dir: Path):
        self.input_dir = input_dir
        self.project_name = input_dir.parent.name
        self.uploaded_files = list(self.input_dir.glob("*.pdf"))

        # directories for storing intermediate files
        self.staging_dir = input_dir.parent.joinpath(".staging")
        self.grobid_output_dir = input_dir.parent.joinpath(".grobid")
        self.storage_dir = input_dir.parent.joinpath(".storage")
        self._create_directories()

        self.references = self._load_references()

    def run(self):
        logger.info(f"Starting ingestion for project: {self.project_name}")

        self._copy_uploads_to_staging()
        self._call_grobid_for_staging()
        self._convert_grobid_xml_to_json()

        self._create_references()
        self._save_references()

        response = self.create_ingest_response()

        for ref in self.references:
            self._remove_temporary_files_for_reference(ref)

        logger.info(f"Finished ingestion for project: {self.project_name}")
        return response

    def _create_directories(self) -> None:
        if not self.staging_dir.exists():
            self.staging_dir.mkdir()

        if not self.grobid_output_dir.exists():
            self.grobid_output_dir.mkdir()

        if not self.storage_dir.exists():
            self.storage_dir.mkdir()

    def _check_for_uploaded_files(self) -> bool:
        """
        Checks for PDF files in the `uploads` directory.

        Returns
        -------
        bool
            True if PDF files are in the `uploads` directory.
        """
        if not self.uploaded_files:
            logger.warning(f"No PDF files found in directory: {self.input_dir}")
            return False
        return True

    def _check_for_staging_files(self) -> bool:
        """
        Checks for PDF files in the `.staging` directory.
        Returns
        -------
        bool
            True if PDF files are in the `.staging` directory.
        """
        if not list(self.staging_dir.glob("*.pdf")):
            logger.warning(f"No PDF files found in directory: {self.staging_dir}")
            return False
        return True

    def _load_references(self) -> list[Reference]:
        """
        Loads existing References list for project. If none exist, this will
        be an empty list.
        References that have been previously processed will not be ingested
        again.
        """
        filepath = self.storage_dir.joinpath("references.json")
        if not filepath.exists():
            logger.warning(f"No previous `references.json` found at {filepath}")
            return []

        jstore = JsonStorage(filepath)
        jstore.load()
        return jstore.references

    def _get_files_to_ingest(self) -> list[Path]:
        """
        Determines which files need to be ingested by comparing the list of
        already processed References against files found in `uploads`.
        """
        if not self._check_for_uploaded_files():
            logger.info("No files have been uploaded")
            sys.exit()

        uploaded_filestems = {fp.stem: fp for fp in self.input_dir.glob("*.pdf")}
        processed_filestems = {
            Path(ref.source_filename).stem: ref.source_filename
            for ref in self.references
        }
        needs_ingestion_filestems = set(uploaded_filestems.keys()) - set(
            processed_filestems.keys()
        )

        if not needs_ingestion_filestems:
            logger.info("All uploaded PDFs have already been processed")
            sys.exit()

        filepaths_to_ingest = [
            uploaded_filestems[stem] for stem in needs_ingestion_filestems
        ]
        return filepaths_to_ingest

    def _copy_uploads_to_staging(self) -> None:
        """
        Copies PDF files in need of ingestion from `self.input_dir` to
        `self.staging_dir` so that files in `uploads` are not mutated and are
        only processed once.
        """
        files_to_ingest = self._get_files_to_ingest()
        logger.info(f"Found {len(files_to_ingest)} new uploads to ingest")

        for filepath in files_to_ingest:
            logger.info(f"Copying {filepath.name} to {self.staging_dir}")
            shutil.copy(filepath, self.staging_dir)

    def _remove_temporary_files_for_reference(self, ref: Reference) -> None:
        """
        Removes a Reference's temporary files that were created during
        various stages of ingestion.
        """
        staging_path = self.staging_dir.joinpath(ref.source_filename)
        shared.remove_file(staging_path)

        # grobid success
        xml_filename = f"{Path(ref.source_filename).stem}.tei.xml"
        xml_path = self.grobid_output_dir.joinpath(xml_filename)
        shared.remove_file(xml_path)

        # grobid failures - there might not be any
        txt_filename = f"{Path(ref.source_filename).stem}*.txt"
        matches = list(self.grobid_output_dir.glob(txt_filename))

        if matches:
            txt_path = matches[0]
            shared.remove_file(txt_path)

        # json converted from grobid XML
        json_filename = f"{Path(ref.source_filename).stem}.json"
        json_path = self.storage_dir.joinpath(json_filename)
        shared.remove_file(json_path)

    def _call_grobid_for_staging(self) -> None:
        """
        Call Grobid server for all files in `.staging` directory.

        Files that are successfully parsed result in a `{filename}.tei.xml`
        file being written to `.grobid`. Files that are unable to be parsed
        are also written to `.grobid`, but their file names are structured
        as `{filename}_{errorcode}.txt` (e.g. some-pdf_500.txt)
        """
        if not self._check_for_staging_files():
            logger.info("No staging files found for Grobid processing")
            sys.exit()

        num_files = len(list(self.staging_dir.glob("*.pdf")))
        timeout = 30 * num_files

        logger.info(f"Calling Grobid server for {num_files} files")

        # The Grobid client library we use prints info and error messages to stdout.
        # This is a problem because the Tauri client <-> sidecar communicate over stdout
        # So we need to wrap Grobid calls inside of `HiddenPrints` to prevent `print`
        # messages from ending up in stdout (https://stackoverflow.com/a/45669280).
        #
        # Longer-term, we should probably fork the Grobid client and make changes
        # to better suit our use-case.
        with shared.HiddenPrints():
            try:
                client = GrobidClient(GROBID_SERVER_URL, timeout=timeout)
            except ServerUnavailableException as e:
                logger.error(e)

            client.process(
                "processHeaderDocument",
                input_path=self.staging_dir,
                output=self.grobid_output_dir,
                force=True,
            )
        logger.info("Finished calling Grobid server")

        # statuses aren't needed right now, but calling this method
        # will write a status message for each file in the logs for us
        _ = self._get_grobid_output_statuses()

    def _get_grobid_output_statuses(self) -> dict[Path, str]:
        """
        Determines the status of Grobid output files.
        """
        # xml files represent Grobid parsing successes - {filename}.tei.xml
        xml_filestems = [
            f.stem.rpartition(".")[0] for f in self.grobid_output_dir.glob("*.xml")
        ]
        # txt files represent Grobid parsing failures - {filename}_{error}.txt
        txt_filestems = [
            f.stem.rpartition("_")[0] for f in self.grobid_output_dir.glob("*.txt")
        ]

        statuses = {}
        for file in self.staging_dir.glob("*.pdf"):
            if file.stem in xml_filestems:
                logger.info(f"Grobid successfully parsed file: {file.name}")
                statuses[file.name] = "success"
            elif file.stem in txt_filestems:
                logger.warning(f"Grobid failed to parse file: {file.name}")
                statuses[file.name] = "failure"
            else:
                logger.warning(f"Grobid did not create an output file: {file.name}")
                statuses[file.name] = "not_found"
        return statuses

    def _convert_grobid_xml_to_json(self) -> None:
        xml_files = list(self.grobid_output_dir.glob("*.xml"))
        logger.info(f"Converting {len(xml_files)} Grobid XML files to JSON")

        for file in xml_files:
            with open(file, "r") as fin:
                xml = fin.read()

            # XML files written by Grobid have the filename as: {filename}.tei.xml
            # We want to strip both the .tei and .xml extensions => {filename}.json
            json_filename = f"{file.stem.rpartition('.tei')[0]}"
            json_filepath = os.path.join(self.storage_dir, f"{json_filename}.json")
            with open(json_filepath, "w") as fout:
                doc = grobid_tei_xml.parse_document_xml(xml)
                json.dump(doc.to_dict(), fout)

    def _parse_header(self, document: dict) -> dict:
        """
        Parses the `header` elements of a Grobid document and returns a
        dictionary of parsed header fields.

        Parameters
        ----------
        dict
            Dictionary of header elements to be parsed

        Returns
        -------
        dict
            Dictionary containing parsed header elements
        """
        header = document.get("header")
        if not header:
            return {}

        if header.get("authors"):
            authors = [self._create_author(author) for author in header["authors"]]
        else:
            authors = []

        return {
            "title": header.get("title"),
            "authors": authors,
            "published_date": header.get("date"),
            "doi": header.get("doi"),  # Added DOI extraction
        }

    def _create_author(self, author_dict: dict) -> Author:
        return Author(
            full_name=author_dict.get("full_name"),
            given_name=author_dict.get("given_name"),
            surname=author_dict.get("surname"),
            email=author_dict.get("email"),
        )

    def _create_references_for_grobid_failures(self) -> list[Reference]:
        """
        Creates Reference objects for PDFs that Grobid was unable to parse.
        We want the output of PDF Ingestion to contain _all_ PDF References, even
        if Grobid was unable to parse them. This allows the frontend to inform the
        user which PDFs we were unable to parse.

        In cases where Grobid was unable to parse the PDF, a TXT file is created
        in the same output directory where the XML file would have been created.
        The TXT file is named as {pdf_filename}_{error_code}.txt.
        """
        txt_files = list(self.grobid_output_dir.glob("*.txt"))
        logger.info(f"Found {len(txt_files)} txt files from Grobid parsing errors")

        references = []
        for file in txt_files:
            logger.info(f"Creating Reference from file: {file.name}")

            source_pdf = f"{file.stem.rpartition('_')[0]}.pdf"
            source_pdf_path = os.path.join(self.staging_dir, source_pdf)
            full_text = shared.extract_text_from_pdf(source_pdf_path)

            references.append(
                Reference(
                    id=str(uuid4()),
                    source_filename=source_pdf,
                    status=IngestStatus.FAILURE,
                    citation_key="untitled",
                    contents=full_text,
                )
            )
        return references

    def _add_citation_keys(self, new_references: list[Reference]) -> list[Reference]:
        """
        Adds unique citation keys for a list of Reference objects based on Pandoc
        citation key formatting rules.

        A citation key is based on the Reference's first author surname
        and published date.

        If two References have the same author surname and published date,
        then the citation key is appended with a, b, c, etc.

        If a Reference does not have an author surname or published date,
        then the citation key becomes "untitled" and is appended with 1, 2, 3, etc.

        If a Reference already has a citation key, then it is not modified.

        https://quarto.org/docs/authoring/footnotes-and-citations.html#sec-citations

        Parameters
        ----------
        new_references : list[References]
            List of newly uploaded References that need citation keys

        Returns
        -------
        references : list[Reference]
            List of References, each with a unique `citation_key` field
        """

        # we must determine the max current "appended" index for key
        # (e.g. 1, 2, 3, a, b, c, etc.)
        # this will determine the starting index for new references
        #
        # we do this by incrementing from what the citation key would have
        # been in its "unappended" format -- what the key would be if we did not
        # have any other references
        max_existing_index_by_key = {}
        for ref in self.references:
            key = shared.create_citation_key(ref)
            if key not in max_existing_index_by_key:
                max_existing_index_by_key[key] = 1
            else:
                max_existing_index_by_key[key] += 1

        new_ref_key_groups = defaultdict(list)
        for ref in new_references:
            key = shared.create_citation_key(ref)
            new_ref_key_groups[key].append(ref)

        for key, new_refs_for_key in new_ref_key_groups.items():
            idx = max_existing_index_by_key.get(key, 0)

            # if no existing references ...
            if idx == 0:
                for i, ref in enumerate(new_refs_for_key):
                    # first ref always gets the "unappended" key
                    # this is necessary to maintain consistency upon new uploads
                    if i == 0:
                        ref.citation_key = f"{key}"
                    else:
                        if key == "untitled":
                            # untitled refs get numbered 1, 2, 3, etc.
                            ref.citation_key = f"{key}{i}"
                        else:
                            # others get numbered a, b, c, etc.
                            ref.citation_key = f"{key}{chr(97 + i)}"

            # if existing references, append as necessary starting
            # from existing max index for the key
            if idx > 0:
                for i, ref in enumerate(new_refs_for_key):
                    if key == "untitled":
                        # untitleds start at 1
                        ref.citation_key = f"{key}{idx + i}"
                    else:
                        # others start at a = chr(97)
                        # so need to subtract 1 since idx >= 1
                        ref.citation_key = f"{key}{chr(97 + idx - 1 + i)}"

        return new_references

    def _create_references(self) -> None:
        """
        Creates new Reference objects, appending them to any we have
        previously loaded.
        """
        json_files = list(self.storage_dir.glob("*.json"))

        # Remove references.json from the list of files to parse
        try:
            fp = self.storage_dir.joinpath("references.json")
            json_files.remove(fp)
        except ValueError:
            pass

        logger.info(f"Found {len(json_files)} Grobid JSON files to parse")

        successes = []
        for file in json_files:
            logger.info(f"Creating Reference from file: {file.name}")

            with open(file, "r") as fin:
                doc = json.load(fin)

            source_pdf = f"{file.stem}.pdf"

            header = self._parse_header(doc)
            pub_date = shared.parse_date(header.get("published_date", ""))

            ref = Reference(
                id=str(uuid4()),
                source_filename=source_pdf,
                status=IngestStatus.COMPLETE,
                title=header.get("title"),
                authors=header.get("authors"),
                doi=header.get("doi"),
                published_date=pub_date,
                abstract=doc.get("abstract"),
                contents=doc.get("body"),
            )
            ref.citation_key = shared.create_citation_key(ref)
            successes.append(ref)

        failures = self._create_references_for_grobid_failures()
        num_created = len(successes) + len(failures)

        msg = (
            f"Created {num_created} Reference objects: "
            f"{len(successes)} Grobid successes, {len(failures)} Grobid failures"
        )
        logger.info(msg)

        new_references = successes + failures
        self._add_citation_keys(new_references)

        # append new references to any we have previously loaded
        for ref in new_references:
            logger.info(f"Creating text chunks for Reference: {ref.source_filename}")
            ref.chunks = shared.chunk_reference(
                ref, filepath=self.staging_dir.joinpath(ref.source_filename)
            )

            self.references.append(ref)

    def _save_references(self) -> None:
        """
        Saves all Reference objects to the filesystem
        """
        filepath = self.storage_dir.joinpath("references.json")
        logger.info(f"Saving references to file: {filepath}")

        contents = [ref.dict() for ref in self.references]
        with open(filepath, "w") as fout:
            json.dump(contents, fout, indent=2, default=str)

    def create_ingest_response(self) -> IngestResponse:
        """
        Creates a Response object from a list of Reference objects

        Returns
        -------
        response : IngestResponse
        """
        return IngestResponse(
            project_name=self.project_name,
            references=self.references,
        )


class IngestStatusFetcher:
    def __init__(self, storage: JsonStorage):
        self.storage = storage
        self.uploads = list(UPLOADS_DIR.glob("*.pdf"))

    def _emit_ingest_status_response(
        self,
        response_status: ResponseStatus,
        reference_statuses: list[ReferenceStatus],
    ):
        """
        Emits IngestStatusResponse as json to stdout and exits.
        """
        response = IngestStatusResponse(
            status=response_status, reference_statuses=reference_statuses
        )
        return response

    def _handle_missing_references_json(self) -> list[ReferenceStatus]:
        """
        Handles scenario where `references.json` does not exist.

        In this case, all files in `upload` will be in process since
        ingest has not created the `references.json` file for storage.
        """
        statuses = []
        for filepath in self.uploads:
            statuses.append(
                ReferenceStatus(
                    source_filename=filepath.name, status=IngestStatus.PROCESSING
                )
            )
        return statuses

    def _compare_uploads_against_references_json(self) -> list[ReferenceStatus]:
        """
        Compares files in `uploads` directory against References stored
        in `references.json` to determine ingestion status.

        Files that are not yet in `references.json` are in process.
        """
        references = {ref.source_filename: ref for ref in self.storage.references}

        statuses = []
        for filepath in self.uploads:
            if filepath.name in references:
                ref = references[filepath.name]

                status = ReferenceStatus(
                    source_filename=ref.source_filename, status=ref.status
                )
            else:
                status = ReferenceStatus(
                    source_filename=filepath.name, status=IngestStatus.PROCESSING
                )
            statuses.append(status)
        return statuses

    def emit_statuses(self):
        try:
            self.storage.load()
        except FileNotFoundError as e:
            logger.warning(e)
            statuses = self._handle_missing_references_json()
            response = self._emit_ingest_status_response(
                response_status=ResponseStatus.OK, reference_statuses=statuses
            )
            return response
        except Exception as e:
            logger.error(f"Error loading references.json: {e}")
            response = self._emit_ingest_status_response(
                response_status=ResponseStatus.ERROR, reference_statuses=[]
            )
            return response

        statuses = self._compare_uploads_against_references_json()
        response = self._emit_ingest_status_response(
            response_status=ResponseStatus.OK, reference_statuses=statuses
        )
        return response
