import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { PdfEditorContent } from '../../atoms/types/EditorContent';
import { useListenEvent } from '../../hooks/useListenEvent';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

interface PdfViewerProps {
  file: PdfEditorContent;
}

export function PdfViewer({ file }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfViewerWidth, setPdfViewerWidth] = useState<number>();

  const fileData = useMemo(() => ({ data: file.binaryContent }), [file]);

  const updateWidth = useCallback(() => {
    setPdfViewerWidth(containerRef.current?.getBoundingClientRect().width);
  }, []);
  useListenEvent('refstudio://layout/update', updateWidth);

  // Update viewer's width on mount
  useLayoutEffect(updateWidth, [updateWidth]);

  const onDocumentLoadSuccess = useCallback((pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
  }, []);

  return (
    <div className="pdf-viewer flex h-full w-full flex-col" ref={containerRef}>
      <Document
        className="flex-1 overflow-y-auto"
        externalLinkTarget="_blank"
        file={fileData}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {numPages &&
          Array.from(new Array(numPages), (_, index) => (
            <Page key={`page_${index + 1}`} loading="" pageNumber={index + 1} width={pdfViewerWidth} />
          ))}
      </Document>
    </div>
  );
}
