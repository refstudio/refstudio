from pathlib import Path
import grobid_tei_xml


def parse_xml_file(filepath: Path) -> str:
    if filepath.suffix != ".xml":
        raise ValueError("Filepath must be a .xml file")

    with open(filepath, "r") as f:
        xml = f.read()
        doc = grobid_tei_xml.parse_document_xml(xml)
    return doc


def main():
    print("Tauri Sidecar!")
    filepath = Path("src-python/test.xml")
    reference = parse_xml_file(filepath)
    print(f"Parsed reference paper: {reference.header.title}")


if __name__ == '__main__':
    main()