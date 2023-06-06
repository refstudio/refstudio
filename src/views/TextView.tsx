import { useEffect, useState } from 'react';

import { readFileEntryAsText } from '../filesystem';
import { FileEntry } from '../types/FileEntry';

export function TextView({
  file,
  textFormatter = (text) => text,
}: {
  file: FileEntry;
  textFormatter?: (input: string) => string;
}) {
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    (async () => {
      const text = await readFileEntryAsText(file);
      setContent(textFormatter(text));
    })();
  }, [file, textFormatter]);

  return (
    <div className="ml-1 h-full w-full overflow-y-auto p-2">
      <pre className="text-xs">{content}</pre>
    </div>
  );
}
