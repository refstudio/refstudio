import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';

import { TabPane } from '../Components/TabPane';
import { cx } from '../cx';
import { readFileAsText } from '../filesystem';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';
import { EditorProps } from '../types/EditorProps';

interface CenterPaneViewProps {
  activeFile?: FileEntry;
  openFiles: FileEntry[];
  onCloseFile(file?: FileEntry): void;
  onSelectFile(file?: FileEntry): void;
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  onSelectionChange(text: string): void;
}

export function CenterPaneView({
  activeFile,
  openFiles,
  onSelectFile,
  onCloseFile,
  editorRef,
  onSelectionChange,
}: CenterPaneViewProps) {
  const items = openFiles.map((file) => ({
    key: file.path,
    text: file.name ?? '-',
    value: file.path,
  }));

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <TabPane
        items={items}
        value={activeFile?.path ?? ''}
        onClick={(path) => onSelectFile(openFiles.find((f) => f.path === path))}
        onCloseClick={(path) => onCloseFile(openFiles.find((f) => f.path === path))}
      />
      <div className="flex h-full w-full overflow-scroll">
        <CenterPaneViewContent activeFile={activeFile} editorRef={editorRef} onSelectionChange={onSelectionChange} />
      </div>
    </div>
  );
}

export function CenterPaneViewContent({
  activeFile,
  editorRef,
  onSelectionChange,
}: Pick<CenterPaneViewProps, 'activeFile' | 'editorRef' | 'onSelectionChange'>) {
  if (!activeFile) {
    return <EmptyView />;
  }

  if (activeFile.path.endsWith('.xml')) {
    return <TextView file={activeFile} />;
  }

  if (activeFile.path.endsWith('.json')) {
    return <TextView file={activeFile} textFormatter={(input) => JSON.stringify(JSON.parse(input), null, 2)} />;
  }

  if (activeFile.path.endsWith('.pdf')) {
    return (
      <div>
        <strong>FILE:</strong>
        <div>
          {activeFile.name} at <code>{activeFile.path}</code>
        </div>
      </div>
    );
  }

  // Use TipTap editor by default!
  return <TipTapView editorRef={editorRef} file={activeFile} onSelectionChange={onSelectionChange} />;
}

function EmptyView() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 bg-slate-300">
      <div className="relative border border-slate-500 text-8xl font-extrabold">
        <EmptyViewLetter className="bg-slate-500 text-slate-200" letter="R" />
        <EmptyViewLetter className="bg-slate-200 text-slate-500" letter="S" />
      </div>
      <span className="text-sm italic">No file selected.</span>
    </div>
  );
}

function EmptyViewLetter({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <div className={cx('inline-flex w-[80px] items-center justify-center text-center', className)}>
      <span>{letter}</span>
    </div>
  );
}

function TipTapView({
  file,
  editorRef,
  onSelectionChange,
}: {
  file: FileEntry;
} & Omit<EditorProps, 'editorContent'>) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const textContent = await readFileAsText(file);
      setContent(textContent);
      setLoading(false);
    })();
  }, [file]);

  if (loading) {
    return <strong>Loading...</strong>;
  }

  return <TipTapEditor editorContent={content} editorRef={editorRef} onSelectionChange={onSelectionChange} />;
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
    <div className="ml-1 h-full w-full overflow-scroll p-2">
      <pre className="text-xs">{content}</pre>
    </div>
  );
}
