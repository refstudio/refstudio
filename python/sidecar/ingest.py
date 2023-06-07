import json
import logging
import os
import sys
from dataclasses import asdict
from pathlib import Path
from typing import List

import grobid_tei_xml
from grobid_client.grobid_client import GrobidClient

from .shared import HiddenPrints, chunk_text, get_filename_md5
from .typing import Author, Reference

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.INFO)
logger.addHandler(stream_handler)
logger.disabled = True

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
        self._create_directories()
        self.call_grobid_server()
        self.convert_grobid_xml_to_json()
        references = self.create_references()
        response = self.create_response_from_references(references)
        sys.stdout.write(json.dumps(response))

    def _create_directories(self) -> None:
        if not self.grobid_output_dir.exists():
            self.grobid_output_dir.mkdir()

        if not self.storage_dir.exists():
            self.storage_dir.mkdir()

    def get_files_to_ingest(self) -> List[Path]:
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
        }

    def _create_author(self, author_dict: dict) -> Author:
        return Author(
            full_name=author_dict.get("full_name"),
            given_name=author_dict.get("given_name"),
            surname=author_dict.get("surname"),
            email=author_dict.get("email"),
        )
    
    def _create_references_for_grobid_failures(self) -> List[Reference]:
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
                )
            )
        return references

    def create_references(self) -> List[Reference]:
        """
        Creates a list of Reference objects from the json files in the storage directory
        :return: List[Reference]
        """
        json_files = list(self.storage_dir.glob("*.json"))
        logger.info(f"Found {len(json_files)} json reference files")

        references = []
        for file in json_files:
            with open(file, 'r') as fin:
                doc = json.load(fin)

            source_pdf = f"{file.stem}.pdf"
            header = self._parse_header(doc)

            ref = Reference(
                source_filename=source_pdf,
                filename_md5=get_filename_md5(source_pdf),
                title=header.get("title"),
                authors=header.get("authors"),
                abstract=doc.get("abstract"),
                contents=doc.get("body"),
                chunks=chunk_text(doc.get("body"))
            )
            references.append(ref)

        failures = self._create_references_for_grobid_failures()
        return references + failures

    def create_response_from_references(self, references: List[Reference]) -> dict:
        """
        Creates a Response object from a list of Reference objects
        :param references: List[Reference]
        :return: Response
        """
        prepared_references = []
        for ref in references:
            # no need to include reference abstract, contents, or chunks in response
            prepared_references.append({
                "source_filename": ref.source_filename,
                "filename_md5": ref.filename_md5,
                "title": ref.title,
                "authors": [asdict(a) for a in ref.authors],
            })
        return {
            "project_name": self.project_name,
            "references": prepared_references
        }


def main(pdf_directory: str):
    pdf_directory = Path(pdf_directory)

    logger.info(f"PDF directory => {pdf_directory}")
    ingest = PDFIngestion(input_dir=pdf_directory)
    ingest.run()
