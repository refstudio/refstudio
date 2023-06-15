import json
import logging
import os
import sys
from dataclasses import asdict
from pathlib import Path

import grobid_tei_xml
from grobid_client.grobid_client import GrobidClient
from sidecar import shared

from .shared import HiddenPrints, chunk_text, get_filename_md5
from .typing import Author, IngestResponse, Reference

logging.root.setLevel(logging.NOTSET)

logger = logging.getLogger(__name__)
handler = logging.FileHandler(
    os.path.join(
        os.environ.get("SIDECAR_LOG_DIR", "/tmp"), "refstudio-sidecar.log"
    )
)
handler.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger.addHandler(handler)
logger.disabled = os.environ.get("SIDECAR_ENABLE_LOGGING", "false").lower() == "true"

GROBID_SERVER_URL = "https://kermitt2-grobid.hf.space"
GROBID_TIMEOUT = 60 * 5


class PDFIngestion:
    def __init__(self, input_dir: Path):
        self.input_dir = input_dir
        self.project_name = input_dir.parent.name

        # directories for storing intermediate files
        self.grobid_output_dir = input_dir.parent.joinpath('.grobid')
        self.storage_dir = input_dir.parent.joinpath('.storage')

    def run(self):
        logger.info(f"Starting ingestion for project: {self.project_name}")
        logger.info(f"Input directory: {self.input_dir}")
        self._create_directories()
        self.call_grobid_server()
        self.convert_grobid_xml_to_json()
        references = self.create_references()
        self.save_references(references)
        response = self.create_response_from_references(references)
        sys.stdout.write(response.to_json())
        logger.info(f"Finished ingestion for project: {self.project_name}")
        logger.info(f"Response: {response}")

    def _create_directories(self) -> None:
        if not self.grobid_output_dir.exists():
            self.grobid_output_dir.mkdir()

        if not self.storage_dir.exists():
            self.storage_dir.mkdir()

    def get_files_to_ingest(self) -> list[Path]:
        """
        Determines which files need to be ingested
        :return: bool
        """
        # fp.stem = fp.name without filetype extension
        pdf_filestems = {fp.stem: fp for fp in self.input_dir.glob("*.pdf")}
        json_filestems = {fp.stem: fp for fp in self.storage_dir.glob("*.json")}
        needs_ingestion_filestems = set(pdf_filestems.keys()) - set(json_filestems.keys())

        if not needs_ingestion_filestems:
            logger.info("All pdf files have already been processed")
            return []

        filepaths_to_ingest = []
        for stem in needs_ingestion_filestems:
            filepaths_to_ingest.append(pdf_filestems[stem])
        return filepaths_to_ingest

    def call_grobid_server(self) -> None:
        pdf_files = list(self.input_dir.glob("*.pdf"))

        # make sure there are PDFs to process
        if not pdf_files:
            logger.warning(f"No pdf files found in directory: {self.input_dir}")
            return

        logger.info(f"Found {len(pdf_files)} pdf files to process")
        logger.info("Calling Grobid server...")

        with HiddenPrints():
            # Grobid prints a message informing that the server is alive
            # This is problematic since the sidecar communicates over stdout
            # thus, HiddenPrint (https://stackoverflow.com/a/45669280)
            client = GrobidClient(GROBID_SERVER_URL, timeout=GROBID_TIMEOUT)

            # If an error occurs during processing, the Grobid Server will
            # print out error messages to stdout, rather than using HTTP status codes
            # or raising an exception. So this line also needs to be wrapped
            # in HiddenPrints.
            # Grobid will still create the output file, even if an error occurs,
            # however it will be a txt file with a name like {filename}_{errorcode}.txt
            client.process(
                "processFulltextDocument",
                input_path=self.input_dir,
                output=self.grobid_output_dir,
                force=True
            )
        logger.info("Finished calling Grobid server")
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
        for file in self.input_dir.glob("*.pdf"):
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

    def convert_grobid_xml_to_json(self) -> None:
        xml_files = list(self.grobid_output_dir.glob("*.xml"))
        logger.info(f"Found {len(xml_files)} xml files to parse")

        for file in xml_files:
            with open(file, "r") as fin:
                xml = fin.read()

            # XML files written by Grobid have the filename structured as: {filename}.tei.xml
            # We want to strip both the .tei and .xml extensions => {filename}.json
            json_filename = f"{file.stem.rpartition('.tei')[0]}"
            json_filepath = os.path.join(self.storage_dir, f"{json_filename}.json")
            with open(json_filepath, "w") as fout:
                doc = grobid_tei_xml.parse_document_xml(xml)
                json.dump(doc.to_dict(), fout)

    def _parse_header(self, document: dict) -> dict:
        """
        Parses the header of a document and returns a dictionary of the header fields
        :param document: dict
        :return: Dict[str, str]
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
            source_pdf = f"{file.stem.rpartition('_')[0]}.pdf"
            references.append(
                Reference(
                    source_filename=source_pdf,
                    filename_md5=get_filename_md5(source_pdf),
                    citation_key="untitled",
                )
            )
        return references
    
    def _create_citation_keys(self, references: list[Reference]) -> str:
        """
        Creates unique citation keys for a list of Reference objects based on Pandoc
        citation key formatting rules.

        Because citation keys are unique, we need to create them after all References
        have been created. This is because the citation key is based on the Reference's
        author surname and published date. If two References have the same author surname
        and published date, then the citation key is appended with a, b, c, etc.

        If a Reference does not have an author surname or published date, then the citation
        key becomes "untitled" and is appended with 1, 2, 3, etc.

        Examples:
        1. Two References with different author surnames and different published year:
            - (Smith, 2018) and (Jones, 2020) => citation keys: smith2018 and jones2020
        2. Two References with different author surnames and no published year:
            - (Smith, None) and (Jones, None) => citation keys: smith and jones
        3. Two References with the same author surname but different published years:
            - (Smith, 2020) and (Smith, 2021) => citation keys: smith2020 and smith2021
        4. Two References with the same author surname and published year:
            - (Smith, 2020) and (Smith, 2020) => citation keys: smith2020a and smith2020b
        5. Two References with the same author surname and no published year:
            - (Smith, None) and (Smith, None) => citation keys: smitha and smithb 
        6. Two References with no author surname and different published years:
            - (None, 2020) and (None, 2021) => citation keys: untitled2020 and untitled2021
        7. Two References with no author surname and no published year:
            - (None, None) and (None, None) => citation keys: untitled1 and untitled2

        :param ref: List[Reference]
        :return: str

        https://quarto.org/docs/authoring/footnotes-and-citations.html#sec-citations
        """
        for ref in references:
            ref.citation_key = shared.create_citation_key(ref)
            # TODO finish this function

    def create_references(self) -> list[Reference]:
        """
        Creates a list of Reference objects from the json files in the storage directory
        :return: List[Reference]
        """
        json_files = list(self.storage_dir.glob("*.json"))

        # Remove references.json from the list of files to parse
        try:
            fp = self.storage_dir.joinpath("references.json")
            json_files.remove(fp)
        except ValueError:
            pass

        logger.info(f"Found {len(json_files)} json reference files")

        references = []
        for file in json_files:
            logger.info(f"Creating Reference from file: {file.name}")

            with open(file, 'r') as fin:
                doc = json.load(fin)

            source_pdf = f"{file.stem}.pdf"
            header = self._parse_header(doc)
            pub_date = shared.parse_date(header.get("published_date", ""))

            ref = Reference(
                source_filename=source_pdf,
                filename_md5=get_filename_md5(source_pdf),
                # `shared.citation_key` takes a Reference as input,
                # so we need to create the Reference object first
                citation_key=None,
                title=header.get("title"),
                authors=header.get("authors"),
                published_date=pub_date,
                abstract=doc.get("abstract"),
                contents=doc.get("body"),
                chunks=chunk_text(doc.get("body"))
            )
            ref.citation_key = shared.create_citation_key(ref)
            references.append(ref)

        failures = self._create_references_for_grobid_failures()

        msg = (
            f"Created {len(references)} Reference objects: "
            f"{len(references)} successful Grobid parses, {len(failures)} Grobid failures"
        )
        logger.info(msg)
        return references + failures
    
    def save_references(self, references: list[Reference]) -> None:
        """
        Saves a list of Reference objects to the filesystem
        """
        filepath = os.path.join(self.storage_dir, "references.json")
        logger.info(f"Saving references to file: {filepath}")

        contents = [asdict(ref) for ref in references]
        with open(filepath, "w") as fout:
            json.dump(contents, fout, indent=2)

    def create_response_from_references(self, references: list[Reference]) -> IngestResponse:
        """
        Creates a Response object from a list of Reference objects
        :param references: List[Reference]
        :return: Response
        """
        return IngestResponse(
            project_name=self.project_name,
            references=references,
        )


def main(pdf_directory: str):
    pdf_directory = Path(pdf_directory)
    ingest = PDFIngestion(input_dir=pdf_directory)
    ingest.run()
