from typing import List
from argparse import ArgumentParser
from grobid_client.grobid_client import GrobidClient
from pathlib import Path
from sentence_transformers import SentenceTransformer
import grobid_tei_xml
import lancedb
import logging
import json
import os


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.INFO)
logger.addHandler(stream_handler)

GROBID_SERVER_URL = "https://kermitt2-grobid.hf.space"
GROBID_TIMEOUT = 60 * 5

MODEL_FOR_EMBEDDINGS = "sentence-transformers/all-MiniLM-L6-v2"


class PDFIngestion:
    def __init__(self, input_dir: Path):
        self.input_dir = input_dir
        self.grobid_output_dir = input_dir.parent.joinpath('grobid')
        self.storage_dir = input_dir.parent.joinpath('storage')

        lancedb_uri = input_dir.parent.joinpath('.lancedb')
        self.lancedb = lancedb.connect(lancedb_uri)

    def _create_directories(self):
        if not self.grobid_output_dir.exists():
            self.grobid_output_dir.mkdir()

        if not self.storage_dir.exists():
            self.storage_dir.mkdir()

    def run(self):
        self._create_directories()
        self.call_grobid_server()
        self.convert_grobid_xml_to_json()
        references = self.chunk_references()
        self.create_and_persist_embeddings(references)

    def call_grobid_server(self):
        pdf_files = list(self.input_dir.glob("*.pdf"))

        # make sure there are PDFs to process
        if not pdf_files:
            logger.warning(f"No pdf files found in directory: {self.input_dir}")
            return

        logger.info(f"Found {len(pdf_files)} pdf files to process")
        logger.info("Calling Grobid server...")
        client = GrobidClient(GROBID_SERVER_URL, timeout=GROBID_TIMEOUT)
        client.process(
            "processFulltextDocument",
            input_path=self.input_dir,
            output=self.grobid_output_dir,
            force=True
        )
        logger.info("Finished calling Grobid server")

    def convert_grobid_xml_to_json(self):
        xml_files = list(self.grobid_output_dir.glob("*.xml"))
        logger.info(f"Found {len(xml_files)} xml files to parse")

        for file in xml_files:
            with open(file, "r") as fin:
                xml = fin.read()

            json_filepath = os.path.join(self.storage_dir, f"{file.stem}.json")
            with open(json_filepath, "w") as fout:
                doc = grobid_tei_xml.parse_document_xml(xml)
                json.dump(doc.to_dict(), fout)

    def chunk_references(self):
        json_files = list(self.storage_dir.glob("*.json"))
        logger.info(f"Found {len(json_files)} json files to chunk")

        references = {}
        for file in json_files:
            with open(file, "r") as fin:
                doc = json.load(fin)

            references[file.stem] = self.chunk_text(doc["body"])
        return references

    def chunk_text(
            self,
            text: str,
            chunk_size: int = 2000,
            chunk_overlap: int = 200
    ) -> List[str]:
        chunks = []
        for i in range(0, len(text), chunk_size - chunk_overlap):
            chunks.append(text[i:i + chunk_size])
        return chunks

    def create_and_persist_embeddings(self, references: dict):
        for key in references.keys():
            if key in self.lancedb.table_names():
                logger.info(f"Table {key} already exists. Skipping...")
                continue

        for file, reference_chunks in references.items():
            model = SentenceTransformer(MODEL_FOR_EMBEDDINGS)
            embeddings = model.encode(reference_chunks)

            mappings = []
            for chunk, emb in zip(reference_chunks, embeddings):
                mappings.append({
                    "text": chunk,
                    "vector": emb.tolist()
                })
            logger.info(f"Created {len(embeddings)} embeddings")

            table = self.lancedb.create_table(name=file, data=mappings)
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