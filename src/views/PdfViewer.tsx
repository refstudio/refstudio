import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { FileEntry } from '@tauri-apps/api/fs';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { readEntryFileAsBinary } from '../filesystem';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { usePromise } from '../hooks/usePromise';
import { PdfViewerAPI } from '../types/PdfViewerAPI';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

interface PdfViewerProps {
  file: FileEntry;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function PdfViewer({ file, pdfViewerRef }: PdfViewerProps) {
  const loadFile = useCallback(() => readEntryFileAsBinary(file), [file]);
  const loadFileState = usePromise(loadFile);

  const [numPages, setNumPages] = useState<number | null>(null);

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

  const onDocumentLoadSuccess = (pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
  };

  if (loadFileState.state === 'loading') {
    return (
      <div>
        <strong>Loading ...</strong>
      </div>
    );
  }

  if (loadFileState.state === 'error') {
    return <div>An error occured while opening the selected file: {String(loadFileState.error)}</div>;
  }

  return (
    <div className="pdf-viewer flex h-full w-full flex-col" ref={containerRef}>
      <Document
        className="flex-1 overflow-y-auto"
        externalLinkTarget="_blank"
        file={{ data: loadFileState.data }}
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
