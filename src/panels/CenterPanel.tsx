import { FileEntry } from '@tauri-apps/api/fs';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { activateFileInPaneAtom, closeFileInPaneAtom, leftPaneAtom, rightPaneAtom } from '../atoms/openFilesState';
import { TabPane } from '../Components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { cx } from '../cx';
import { readFileAsText } from '../filesystem';
import { usePromise } from '../hooks/use-promise';
import { PdfViewer } from '../PdfViewer';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';
import { PdfViewerAPI } from '../types/PdfViewerAPI';

interface CenterPanelProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function CenterPanel({ editorRef, pdfViewerRef }: CenterPanelProps) {
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);
  const activateFileInPane = useSetAtom(activateFileInPaneAtom);
  const closeFileInPane = useSetAtom(closeFileInPaneAtom);

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <>
      <PanelGroup direction="horizontal" onLayout={updatePDFViewerWidth}>
        <Panel>
          <CenterPanelPane
            activeFile={left.active}
            editorRef={editorRef}
            files={left.files}
            handleTabClick={(path) => activateFileInPane({ pane: left.id, path })}
            handleTabCloseClick={(path) => closeFileInPane({ pane: left.id, path })}
            pdfViewerRef={pdfViewerRef}
          />
        </Panel>
        {right.files.length > 0 && <VerticalResizeHandle />}
        {right.files.length > 0 && (
          <Panel>
            <CenterPanelPane
              activeFile={right.active}
              editorRef={editorRef}
              files={right.files}
              handleTabClick={(path) => activateFileInPane({ pane: right.id, path })}
              handleTabCloseClick={(path) => closeFileInPane({ pane: right.id, path })}
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
  const loadFile = React.useCallback(() => readFileAsText(file), [file]);
  const contentState = usePromise(loadFile);

  if (contentState.state === 'loading') {
    return <strong>Loading...</strong>;
  } else if (contentState.state === 'error') {
    return <strong>Error: {String(contentState.error)}</strong>;
  }

  const content = contentState.data;
  return <TipTapEditor editorContent={content} editorRef={editorRef} />;
}

function TextView({
  file,
  textFormatter = (text) => text,
}: {
  file: FileEntry;
  textFormatter?: (input: string) => string;
}) {
  const loadFile = React.useCallback(async () => {
    const text = await readFileAsText(file);
    return textFormatter(text);
  }, [file, textFormatter]);
  const contentState = usePromise(loadFile);

  const content =
    contentState.state === 'error'
      ? `Error: ${contentState.error}`
      : contentState.state === 'loading'
      ? 'Loading…'
      : contentState.data;

  return (
    <div className="ml-1 h-full w-full overflow-scroll p-2">
      <pre className="text-xs">{content}</pre>
    </div>
  );
}
