import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './index.css';

import { FileEntry } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";

import { readFile } from "../filesystem";

interface PdfViewerProps {
  file: FileEntry;
}

export const PdfViewer = ({ file }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  const [fileContent, setFileContent] = useState<{ data: Uint8Array } | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsFileLoading(true);
    (async () => {
      try {
        const content = await readFile(file);
        setFileContent({ data: content });
        setIsFileLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          console.error(err);
          setError('Unknown error');
        }
      }
    })()
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }

  if (error) return <div><strong>error</strong></div>;
  if (isFileLoading) return <div><strong>Loading</strong></div>;
  return (
    <Document
      file={fileContent}
      onLoadSuccess={onDocumentLoadSuccess}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
      ))}
    </Document>
  );
}