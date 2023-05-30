import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { FileEntry } from '@tauri-apps/api/fs';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { readFile } from '../filesystem';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { PdfViewerAPI } from '../types/PdfViewerAPI';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

interface PdfViewerProps {
  file: FileEntry;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function PdfViewer({ file, pdfViewerRef }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const [fileContent, setFileContent] = useState<{ data: Uint8Array } | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfViewerWidth, setPdfViewerWidth] = useState<number>();

  const updateWidth = useCallback(() => {
    setPdfViewerWidth(containerRef.current?.getBoundingClientRect().width);
  }, []);

  const debouncedUpdateWidth = useDebouncedCallback(updateWidth, 200);

  // Update viewer's width on mount
  useLayoutEffect(debouncedUpdateWidth, [debouncedUpdateWidth]);

  // Update viewer's width on window resize
  useEffect(() => {
    window.addEventListener('resize', debouncedUpdateWidth);

    return () => {
      window.removeEventListener('resize', debouncedUpdateWidth);
    };
  }, [debouncedUpdateWidth]);

  // Update viewer's width on panel resize
  useEffect(() => {
    pdfViewerRef.current = { updateWidth: debouncedUpdateWidth };

    return () => {
      pdfViewerRef.current = null;
    };
  }, [pdfViewerRef, debouncedUpdateWidth]);

  useEffect(() => {
    setNumPages(null);
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
    })();
  }, [file]);

  const onDocumentLoadSuccess = (pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
  };

  if (error) {
    return <div>An error occured while opening the selected file: {error}</div>;
  }

  if (isFileLoading) {
    return (
      <div>
        <strong>Loading</strong>
      </div>
    );
  }

  return (
    <div className="pdf-viewer flex h-full flex-col" ref={containerRef}>
      <Document
        className="flex-1 overflow-scroll"
        externalLinkTarget="_blank"
        file={fileContent}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {numPages &&
          Array.from(new Array(numPages), (_, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} width={pdfViewerWidth} />
          ))}
      </Document>
    </div>
  );
}
