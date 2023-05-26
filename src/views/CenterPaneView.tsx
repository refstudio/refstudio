import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';

import { readFile } from '../filesystem';
import { PdfViewer } from '../PdfViewer';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { CenterPaneViewProps } from '../types/CenterPaneViewProps';

function isTipTap(file?: FileEntry) {
  return file?.path.endsWith('.tiptap');
}

function isPdf(file?: FileEntry) {
  return file?.path.endsWith('.pdf');
}

export function CenterPaneView({ file, pdfViewerRef, ...props }: CenterPaneViewProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (file && isTipTap(file)) {
      setLoading(true);
      (async () => {
        const content = await readFile(file);
        const textContent = new TextDecoder('utf-8').decode(content);
        setContent(textContent);
        setLoading(false);
      })()
    }
  }, [file]);

  if (loading) return <div className="p-3"><strong>Loading...</strong></div>;

  if (file && isTipTap(file)) return <TipTapEditor {...props} editorContent={content} />;

  if (file && isPdf(file)) return <PdfViewer file={file} pdfViewerRef={pdfViewerRef} />;

  return (
    <div className='p-3'>
      <strong>FILE:</strong>
      <div>{file?.name} at <code>{file?.path}</code></div>
    </div>
  );
}
