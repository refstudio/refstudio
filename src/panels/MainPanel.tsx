import { FileEntry } from '@tauri-apps/api/fs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { activateFileInPaneAtom, closeFileInPaneAtom, leftPaneAtom, rightPaneAtom } from '../atoms/openFilesState';
import { TabPane } from '../components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { EditorAPI } from '../types/EditorAPI';
import { PdfViewerAPI } from '../types/PdfViewerAPI';
import { EmptyView } from '../views/EmptyView';
import { PdfViewer } from '../views/PdfViewer';
import { TextView } from '../views/TextView';
import { TipTapView } from '../views/TipTapView';

interface MainPanelProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPanel(props: MainPanelProps) {
  const { pdfViewerRef } = props;
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
          <MainPanelPane
            activeFile={left.active}
            files={left.files}
            handleTabClick={(path) => activateFileInPane({ pane: left.id, path })}
            handleTabCloseClick={(path) => closeFileInPane({ pane: left.id, path })}
            {...props}
          />
        </Panel>
        {right.files.length > 0 && <VerticalResizeHandle />}
        {right.files.length > 0 && (
          <Panel>
            <MainPanelPane
              activeFile={right.active}
              files={right.files}
              handleTabClick={(path) => activateFileInPane({ pane: right.id, path })}
              handleTabCloseClick={(path) => closeFileInPane({ pane: right.id, path })}
              {...props}
            />
          </Panel>
        )}
      </PanelGroup>
    </>
  );
}

interface MainPanelPaneProps {
  files: readonly FileEntry[];
  activeFile?: FileEntry;
  handleTabClick(path: string): void;
  handleTabCloseClick(path: string): void;
}

export function MainPanelPane({
  files,
  activeFile,
  handleTabClick,
  handleTabCloseClick,
  editorRef,
  pdfViewerRef,
}: MainPanelPaneProps & MainPanelProps) {
  const items = files.map((file) => ({
    key: file.path,
    text: file.name ?? '',
    value: file.path,
  }));

  return (
    <div className="h-full grid-rows-[auto_1fr] ">
      <TabPane items={items} value={activeFile?.path} onClick={handleTabClick} onCloseClick={handleTabCloseClick} />
      <div className="flex h-full w-full overflow-scroll">
        <MainPaneViewContent activeFile={activeFile} editorRef={editorRef} pdfViewerRef={pdfViewerRef} />
      </div>
    </div>
  );
}

interface MainPaneViewContentProps {
  activeFile?: FileEntry;
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPaneViewContent({ activeFile, editorRef, pdfViewerRef }: MainPaneViewContentProps) {
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
