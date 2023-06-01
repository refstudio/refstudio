import { FileEntry } from '@tauri-apps/api/fs';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import {
  activateFileAction,
  closeFileAction,
  leftPaneAtom,
  openFilesAtom,
  PaneId,
  rightPaneAtom,
} from '../atoms/openFilesState';
import { TabPane } from '../Components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { cx } from '../cx';
import { readFileAsText } from '../filesystem';
import { PdfViewer } from '../PdfViewer';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';
import { PdfViewerAPI } from '../types/PdfViewerAPI';

interface CenterPanelProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function CenterPanel({ editorRef, pdfViewerRef }: CenterPanelProps) {
  const [openFiles, setOpenFiles] = useAtom(openFilesAtom);
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);

  const handleTabClick = (pane: PaneId) => (path: string) => {
    const file = openFiles.files[path];
    if (file) {
      setOpenFiles(activateFileAction(openFiles, pane, file));
    }
  };

  const handleTabCloseClick = (pane: PaneId) => (path: string) => {
    const file = openFiles.files[path];
    if (file) {
      setOpenFiles(closeFileAction(openFiles, pane, file));
    }
  };

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  const leftFiles = left.files;
  const rightFiles = right.files;

  return (
    <>
      <PanelGroup direction="horizontal" onLayout={updatePDFViewerWidth}>
        <Panel>
          <CenterPanelPane
            activeFile={left.active}
            editorRef={editorRef}
            files={leftFiles}
            handleTabClick={handleTabClick('LEFT')}
            handleTabCloseClick={handleTabCloseClick('LEFT')}
            pdfViewerRef={pdfViewerRef}
          />
        </Panel>
        {right.files.length > 0 && <VerticalResizeHandle />}
        {right.files.length > 0 && (
          <Panel>
            <CenterPanelPane
              activeFile={right.active}
              editorRef={editorRef}
              files={rightFiles}
              handleTabClick={handleTabClick('RIGHT')}
              handleTabCloseClick={handleTabCloseClick('RIGHT')}
              pdfViewerRef={pdfViewerRef}
            />
          </Panel>
        )}
      </PanelGroup>
    </>
  );
}

interface CenterPanelPaneProps {
  files: FileEntry[];
  activeFile?: FileEntry;
  handleTabClick(path: string): void;
  handleTabCloseClick(path: string): void;
}

export function CenterPanelPane({
  files,
  activeFile,
  handleTabClick,
  handleTabCloseClick,
  editorRef,
  pdfViewerRef,
}: CenterPanelPaneProps & CenterPanelProps) {
  const items = files.map((file) => ({
    key: file.path,
    text: file.name ?? '',
    value: file.path,
  }));

  return (
    <div className="h-full grid-rows-[auto_1fr] ">
      <TabPane items={items} value={activeFile?.path} onClick={handleTabClick} onCloseClick={handleTabCloseClick} />
      <div className="flex h-full w-full overflow-scroll">
        <CenterPaneViewContent activeFile={activeFile} editorRef={editorRef} pdfViewerRef={pdfViewerRef} />
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
