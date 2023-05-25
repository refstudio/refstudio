import sys
from dataclasses import asdict
from typing import List
from argparse import ArgumentParser
from grobid_client.grobid_client import GrobidClient
from pathlib import Path
import grobid_tei_xml
import lancedb
import logging
import json
import os

from .shared import chunk_text, embed_text, HiddenPrints
from .typing import Reference, Author


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
        self.grobid_output_dir = input_dir.parent.joinpath('grobid')
        self.storage_dir = input_dir.parent.joinpath('storage')

        # components for embeddings creation and storage
        self.lancedb_uri = input_dir.parent.joinpath('.lancedb')
        self.lancedb = lancedb.connect(self.lancedb_uri)

    def run(self):
        self._create_directories()
        self.call_grobid_server()
        self.convert_grobid_xml_to_json()
        references = self.create_references()
        self.create_and_persist_embeddings(references)
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

            header = self._parse_header(doc)
            ref = Reference(
                source_filename=file.name,
                title=header.get("title"),
                authors=header.get("authors"),
                abstract=doc.get("abstract"),
                contents=doc.get("body"),
                chunks=chunk_text(doc.get("body"))
            )
            references.append(ref)
        return references

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
                "title": ref.title,
                "authors": [asdict(a) for a in ref.authors],
            })
        return {
            "project_name": self.project_name,
            "references": prepared_references
        }

    def _already_has_embeddings(self, ref: Reference) -> bool:
        tables = self.lancedb.table_names()

        if self.project_name not in tables:
            return False

        table = self.lancedb.open_table(self.project_name)
        already_seen = set(table.to_pandas()["source_filename"].tolist())
        return ref.source_filename in already_seen

    def create_and_persist_embeddings(self, references: List[Reference]) -> None:
        for ref in references:
            if self._already_has_embeddings(ref):
                logger.info(f"Reference {ref.title} already exists. Skipping...")
                continue

            embeddings = embed_text([c.text for c in ref.chunks])
            authors = [asdict(a) for a in ref.authors]

            rows = []
            for chunk, emb in zip(ref.chunks, embeddings):
                rows.append({
                    "source_filename": ref.source_filename,
                    "title": ref.title,
                    "authors": authors,
                    "abstract": ref.abstract,
                    "text": chunk.text,
                    "vector": emb.tolist()
                })
            logger.info(f"Created {len(embeddings)} embeddings")

            if self.project_name not in self.lancedb.table_names():
                table = self.lancedb.create_table(name=self.project_name, data=rows)
            else:
                table = self.lancedb.open_table(self.project_name)
                table.add(data=rows)

            logger.info(f"Wrote {len(embeddings)} embeddings to {table.name} table")


def main(pdf_directory: str):
    pdf_directory = Path(pdf_directory)

    logger.info(f"PDF directory => {pdf_directory}")
    ingest = PDFIngestion(input_dir=pdf_directory)
    ingest.run()


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--pdf_directory", type=str)
    args = parser.parse_args()

    main(args.pdf_directory)
