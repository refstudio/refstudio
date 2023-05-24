import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';

import { FileEntryInfo } from '../features/openedFiles/openedFilesSlice';
import { readFile } from '../filesystem';
import { useAppSelector } from '../redux/hooks';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';

export interface CenterPaneViewProps {
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
}

export function CenterPaneView(props: CenterPaneViewProps) {
  const selectedFile = useAppSelector((state) => state.openedFiles.selectedFile);

  if (!selectedFile) return <span>Please select a file in the project tree.</span>;
  if (selectedFile.type === 'TipTap') return <EditorView selectedFile={selectedFile} {...props} />;
  if (selectedFile.type === 'PDF') return <PDFView file={selectedFile.entry} />;
  return <span>Unknown file: {selectedFile.entry.path}</span>;
}

function EditorView({ selectedFile, ...props }: { selectedFile: FileEntryInfo } & CenterPaneViewProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      // Note: Somehow I need need to await a bit for the TipTap to work!!
      await new Promise((resolve) => setTimeout(resolve, 100));
      const content = await readFile(selectedFile.entry);
      const textContent = new TextDecoder('utf-8').decode(content);
      setContent(textContent);
      setLoading(false);
    })();
  }, [selectedFile]);

  if (loading) return <span>Loading...</span>;
  return <TipTapEditor {...props} editorContent={content} />;
}

function PDFView({ file }: { file: FileEntry }) {
  return (
    <div>
      <strong>FILE:</strong>
      <div>
        {file?.name} at <code>{file?.path}</code>
      </div>
    </div>
  );
}
