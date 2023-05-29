import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';

import { readFile, readFileAsText } from '../filesystem';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { CenterPaneViewProps } from '../types/CenterPaneViewProps';

function isTipTap(file?: FileEntry) {
  return file?.path.endsWith('.tiptap');
}

export function CenterPaneView({ file, ...props }: CenterPaneViewProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (file && isTipTap(file)) {
      setLoading(true);
      (async () => {
        const newBytes = await readFile(file);
        const textContent = new TextDecoder('utf-8').decode(newBytes);
        setContent(textContent);
        setLoading(false);
      })();
    }
  }, [file]);

  if (loading) {
    return (
      <div className="p-3">
        <strong>Loading...</strong>
      </div>
    );
  }

  if (file && isTipTap(file)) {
    return <TipTapEditor {...props} editorContent={content} />;
  }

  if (file?.path.endsWith('.xml')) {
    return <TextView file={file} />;
  }

  if (file?.path.endsWith('.json')) {
    return <TextView file={file} textFormatter={(input) => JSON.stringify(JSON.parse(input), null, 2)} />;
  }

  return (
    <div className="p-3">
      <strong>FILE:</strong>
      <div>
        {file?.name} at <code>{file?.path}</code>
      </div>
    </div>
  );
}

function TextView({
  file,
  textFormatter = (text) => text,
}: {
  file: FileEntry;
  textFormatter?: (input: string) => string;
}) {
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    (async () => {
      const text = await readFileAsText(file);
      setContent(textFormatter(text));
    })();
  }, [file, textFormatter]);

  return (
    <div className="ml-1 h-full overflow-scroll p-2">
      <pre className="text-xs">{content}</pre>
    </div>
  );
}
