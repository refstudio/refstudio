import { Atom, useAtomValue, useSetAtom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';
import { useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { FileId } from '../atoms/core/atom.types';
import { _selectFileInPaneAtom } from '../atoms/core/paneGroupAtom';
import { closeFileFromPaneAtom, focusPaneAtom, leftPaneAtom, rightPaneAtom } from '../atoms/fileActions';
import { Spinner } from '../components/Spinner';
import { TabPane } from '../components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { EditorAPI } from '../types/EditorAPI';
import { FileContent } from '../types/FileContent';
import { FileEntry } from '../types/FileEntry';
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
  const activateFileInPane = useSetAtom(_selectFileInPaneAtom);
  const closeFileInPane = useSetAtom(closeFileFromPaneAtom);
  const focusPane = useSetAtom(focusPaneAtom);

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  return (
    <>
      <PanelGroup direction="horizontal" onLayout={updatePDFViewerWidth}>
        <Panel>
          <MainPanelPane
            activeFile={left.activeFile}
            activeFileAtom={left.activeFileAtom}
            files={left.files}
            handleTabClick={(path) => activateFileInPane({ paneId: left.id, fileId: path })}
            handleTabCloseClick={(path) => closeFileInPane({ paneId: left.id, fileId: path })}
            onPaneFocused={() => focusPane('LEFT')}
            {...props}
          />
        </Panel>
        {right.files.length > 0 && <VerticalResizeHandle />}
        {right.files.length > 0 && (
          <Panel>
            <MainPanelPane
              activeFile={right.activeFile}
              activeFileAtom={right.activeFileAtom}
              files={right.files}
              handleTabClick={(path) => activateFileInPane({ paneId: right.id, fileId: path })}
              handleTabCloseClick={(path) => closeFileInPane({ paneId: right.id, fileId: path })}
              onPaneFocused={() => focusPane('RIGHT')}
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
  activeFileAtom?: Atom<Loadable<Promise<FileContent>>>;
  handleTabClick(path: string): void;
  handleTabCloseClick(path: string): void;
  onPaneFocused(): void;
}

export function MainPanelPane({
  files,
  activeFile,
  activeFileAtom,
  handleTabClick,
  handleTabCloseClick,
  editorRef,
  onPaneFocused,
  pdfViewerRef,
}: MainPanelPaneProps & MainPanelProps) {
  const items = files.map((file) => ({
    key: file.path,
    text: file.name,
    value: file.path,
  }));

  return (
    <div className="h-full grid-cols-1 grid-rows-[auto_1fr]" onClick={onPaneFocused} onFocus={onPaneFocused}>
      <TabPane items={items} value={activeFile?.path} onClick={handleTabClick} onCloseClick={handleTabCloseClick} />
      <div className="flex h-full w-full overflow-hidden">
        {activeFile && activeFileAtom ? (
          <MainPaneViewContent
            activeFileAtom={activeFileAtom}
            editorRef={editorRef}
            fileId={activeFile.path}
            pdfViewerRef={pdfViewerRef}
          />
        ) : (
          <EmptyView />
        )}
      </div>
    </div>
  );
}

interface MainPaneViewContentProps {
  activeFileAtom: Atom<Loadable<Promise<FileContent>>>;
  editorRef: React.MutableRefObject<EditorAPI | null>;
  fileId: FileId;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPaneViewContent({ activeFileAtom, editorRef, pdfViewerRef }: MainPaneViewContentProps) {
  const loadableFileContent = useAtomValue(activeFileAtom);

  if (loadableFileContent.state === 'loading') {
    return <Spinner />;
  }

  if (loadableFileContent.state === 'hasError') {
    return <strong>Error: {String(loadableFileContent.error)}</strong>;
  }

  if (loadableFileContent.data.type === 'XML') {
    return <TextView file={loadableFileContent.data} />;
  }

  if (loadableFileContent.data.type === 'JSON') {
    return (
      <TextView file={loadableFileContent.data} textFormatter={(input) => JSON.stringify(JSON.parse(input), null, 2)} />
    );
  }

  if (loadableFileContent.data.type === 'PDF') {
    return <PdfViewer file={loadableFileContent.data} pdfViewerRef={pdfViewerRef} />;
  }

  // Use TipTap editor by default!
  return <TipTapView editorRef={editorRef} file={loadableFileContent.data} />;
}
