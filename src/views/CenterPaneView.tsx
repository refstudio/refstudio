import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { TabPane } from '../Components/TabPane';
import { VerticalResizeHandle } from '../Components/VerticalResizeHandle';
import { cx } from '../cx';
import { FilesAction, FilesState } from '../filesReducer';
import { readFileAsText } from '../filesystem';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';
import { EditorProps } from '../types/EditorProps';

interface CenterPaneViewProps {
  files: FilesState;
  filesDispatch: React.Dispatch<FilesAction>;

  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  onSelectionChange(text: string): void;
}

export function CenterPaneView({
  files,
  filesDispatch,

  editorRef,
  onSelectionChange,
}: CenterPaneViewProps) {
  const leftPane = files.openFiles.filter((entry) => entry.pane === 'LEFT');
  const rightPane = files.openFiles.filter((entry) => entry.pane === 'RIGHT');
  const someRight = rightPane.length > 0;

  const activeLeftEntry = files.openFiles.find((e) => e.pane === 'LEFT' && e.active);
  const activeRightEntry = files.openFiles.find((e) => e.pane === 'RIGHT' && e.active);

  const leftItems = leftPane.map((entry) => ({
    key: entry.file.path,
    text: entry.file.name ?? '-',
    value: entry.file.path,
  }));
  const rightItems = rightPane.map((entry) => ({
    key: entry.file.path,
    text: entry.file.name ?? '-',
    value: entry.file.path,
  }));

  function handleTabClick(path: string, pane: FilesState['openFiles'][0]['pane']) {
    const fileToClose = files.openFiles.find((f) => f.file.path === path)?.file;
    if (!fileToClose) {
      return;
    }
    filesDispatch({ type: 'OPEN_FILE', payload: { file: fileToClose, pane } });
  }
  function handleTabCloseClick(path: string, pane: FilesState['openFiles'][0]['pane']) {
    const fileToClose = files.openFiles.find((f) => f.file.path === path)?.file;
    if (!fileToClose) {
      return;
    }
    filesDispatch({ type: 'CLOSE_FILE', payload: { file: fileToClose, pane } });
  }

  // useEffect(() => {
  //   setRightItems(openFiles.filter((file) => file.path.endsWith('.pdf')).map((file) => file.path));
  // }, [openFiles]);

  return (
    <PanelGroup direction="horizontal">
      {/* LEFT PANEL */}
      <Panel>
        <div className="grid h-full grid-rows-[auto_1fr]">
          <TabPane
            items={leftItems}
            value={activeLeftEntry?.file.path ?? ''}
            onClick={(path) => handleTabClick(path, 'LEFT')}
            onCloseClick={(path) => handleTabCloseClick(path, 'LEFT')}
          />
          <div className="flex h-full w-full overflow-scroll">
            <CenterPaneViewContent
              activeFile={activeLeftEntry?.file}
              editorRef={editorRef}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      </Panel>
      {someRight && <VerticalResizeHandle />}
      {/* RIGHT PANEL */}
      {someRight && (
        <Panel>
          <div className="grid h-full grid-rows-[auto_1fr]">
            <TabPane
              items={rightItems}
              value={activeRightEntry?.file.path ?? ''}
              onClick={(path) => handleTabClick(path, 'RIGHT')}
              onCloseClick={(path) => handleTabCloseClick(path, 'RIGHT')}
            />
            <div className="flex h-full w-full overflow-scroll">
              <CenterPaneViewContent
                activeFile={activeRightEntry?.file}
                editorRef={editorRef}
                onSelectionChange={onSelectionChange}
              />
            </div>
          </div>
        </Panel>
      )}
    </PanelGroup>
  );
}

interface CenterPaneViewContentProps {
  activeFile?: FileEntry;
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  onSelectionChange(text: string): void;
}

export function CenterPaneViewContent({ activeFile, editorRef, onSelectionChange }: CenterPaneViewContentProps) {
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
