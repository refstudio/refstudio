import { FileEntry } from '@tauri-apps/api/fs';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { TabPane } from '../Components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { cx } from '../cx';
import { FilesAction, FilesState } from '../filesReducer';
import { readFileAsText } from '../filesystem';
import { PdfViewer } from '../PdfViewer';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';
import { PdfViewerAPI } from '../types/PdfViewerAPI';

interface CenterPanelProps {
  files: FilesState;
  filesDispatch: React.Dispatch<FilesAction>;
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function CenterPanel({ files, filesDispatch, editorRef, pdfViewerRef }: CenterPanelProps) {
  const someRight = files.openFiles.some((e) => e.pane === 'RIGHT');

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <PanelGroup direction="horizontal" onLayout={updatePDFViewerWidth}>
      <Panel>
        <CenterPanelPane
          editorRef={editorRef}
          files={files}
          filesDispatch={filesDispatch}
          pane="LEFT"
          pdfViewerRef={pdfViewerRef}
        />
      </Panel>
      {someRight && <VerticalResizeHandle />}
      {someRight && (
        <Panel>
          <CenterPanelPane
            editorRef={editorRef}
            files={files}
            filesDispatch={filesDispatch}
            pane="RIGHT"
            pdfViewerRef={pdfViewerRef}
          />
        </Panel>
      )}
    </PanelGroup>
  );
}

export function CenterPanelPane({
  files,
  filesDispatch,
  pane,
  editorRef,
  pdfViewerRef,
}: { pane: FilesState['openFiles'][0]['pane'] } & CenterPanelProps) {
  const paneOpenFiles = files.openFiles.filter((entry) => entry.pane === pane);
  const activeEntry = paneOpenFiles.find((e) => e.active);
  const items = paneOpenFiles.map((entry) => ({
    key: entry.file.path,
    text: entry.file.name ?? '-',
    value: entry.file.path,
  }));

  function handleTabClick(path: string) {
    const fileToClose = paneOpenFiles.find((f) => f.file.path === path)?.file;
    if (!fileToClose) {
      return;
    }
    filesDispatch({ type: 'OPEN_FILE', payload: { file: fileToClose, pane } });
  }
  function handleTabCloseClick(path: string) {
    const fileToClose = paneOpenFiles.find((f) => f.file.path === path)?.file;
    if (!fileToClose) {
      return;
    }
    filesDispatch({ type: 'CLOSE_FILE', payload: { file: fileToClose, pane } });
  }

  return (
    <div className="h-full grid-rows-[auto_1fr] ">
      <TabPane
        items={items}
        value={activeEntry?.file.path ?? ''}
        onClick={(path) => handleTabClick(path)}
        onCloseClick={(path) => handleTabCloseClick(path)}
      />
      <div className="flex h-full w-full overflow-scroll">
        <CenterPaneViewContent activeFile={activeEntry?.file} editorRef={editorRef} pdfViewerRef={pdfViewerRef} />
      </div>
    </div>
  );
}

interface CenterPaneViewContentProps {
  activeFile?: FileEntry;
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function CenterPaneViewContent({ activeFile, editorRef, pdfViewerRef }: CenterPaneViewContentProps) {
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
    return <PdfViewer file={activeFile} pdfViewerRef={pdfViewerRef} />;
  }

  // Use TipTap editor by default!
  return <TipTapView editorRef={editorRef} file={activeFile} />;
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

function TipTapView({ file, editorRef }: { file: FileEntry; editorRef: React.MutableRefObject<EditorAPI | null> }) {
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

  return <TipTapEditor editorContent={content} editorRef={editorRef} />;
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
