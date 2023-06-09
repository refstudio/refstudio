import { Atom, useAtomValue, useSetAtom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';
import { useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import {
  closeFileFromPaneAtom,
  focusPaneAtom,
  leftPaneAtom,
  rightPaneAtom,
  selectFileInPaneAtom,
} from '../atoms/fileActions';
import { FileContent } from '../atoms/types/FileContent';
import { FileId } from '../atoms/types/FileEntry';
import { PaneContent } from '../atoms/types/PaneGroup';
import { Spinner } from '../components/Spinner';
import { TabPane } from '../components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { EditorAPI } from '../types/EditorAPI';
import { PdfViewerAPI } from '../types/PdfViewerAPI';
import { assertNever } from '../utils/assertNever';
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
  const selectFileInPane = useSetAtom(selectFileInPaneAtom);
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
            handleTabClick={(path) => selectFileInPane({ paneId: left.id, fileId: path })}
            handleTabCloseClick={(path) => closeFileInPane({ paneId: left.id, fileId: path })}
            pane={left}
            onPaneFocused={() => focusPane(left.id)}
            {...props}
          />
        </Panel>
        {right.files.length > 0 && <VerticalResizeHandle />}
        {right.files.length > 0 && (
          <Panel>
            <MainPanelPane
              handleTabClick={(path) => selectFileInPane({ paneId: right.id, fileId: path })}
              handleTabCloseClick={(path) => closeFileInPane({ paneId: right.id, fileId: path })}
              pane={right}
              onPaneFocused={() => focusPane(right.id)}
              {...props}
            />
          </Panel>
        )}
      </PanelGroup>
    </>
  );
}

interface MainPanelPaneProps {
  pane: PaneContent;
  handleTabClick(path: string): void;
  handleTabCloseClick(path: string): void;
  onPaneFocused(): void;
}

export function MainPanelPane({
  pane,
  handleTabClick,
  handleTabCloseClick,
  editorRef,
  onPaneFocused,
  pdfViewerRef,
}: MainPanelPaneProps & MainPanelProps) {
  const { files, activeFile, activeFileContent } = pane;
  const items = files.map((file) => ({
    key: file.path,
    text: file.name,
    value: file.path,
  }));

  return (
    <div className="h-full grid-cols-1 grid-rows-[auto_1fr]" onClick={onPaneFocused} onFocus={onPaneFocused}>
      <TabPane items={items} value={activeFile?.path} onClick={handleTabClick} onCloseClick={handleTabCloseClick} />
      <div className="flex h-full w-full overflow-hidden">
        {activeFile && activeFileContent ? (
          <MainPaneViewContent
            activeFileAtom={activeFileContent}
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

  const { data } = loadableFileContent;

  switch (data.type) {
    case 'xml':
      return <TextView file={data} />;
    case 'json':
      return <TextView file={data} textFormatter={(input) => JSON.stringify(JSON.parse(input), null, 2)} />;
    case 'pdf':
      return <PdfViewer file={data} pdfViewerRef={pdfViewerRef} />;
    case 'tiptap':
      return <TipTapView editorRef={editorRef} file={data} />;
    default: {
      assertNever(data);
      return null;
    }
  }
}
