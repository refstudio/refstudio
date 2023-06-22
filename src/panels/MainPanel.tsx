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
import { FileId } from '../atoms/types/FileData';
import { PaneContent } from '../atoms/types/PaneGroup';
import { Spinner } from '../components/Spinner';
import { TabPane } from '../components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { PdfViewerAPI } from '../types/PdfViewerAPI';
import { assertNever } from '../utils/assertNever';
import { EmptyView } from '../views/EmptyView';
import { PdfViewer } from '../views/PdfViewer';
import { ReferenceView } from '../views/ReferenceView';
import { TextView } from '../views/TextView';
import { TipTapView } from '../views/TipTapView';

interface MainPanelProps {
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPanel(props: MainPanelProps) {
  const { pdfViewerRef } = props;
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  const showRight = right.files.length > 0;
  const showLeft = left.files.length > 0 || !showRight;

  return (
    <>
      <PanelGroup autoSaveId="mainPanel" direction="horizontal" onLayout={updatePDFViewerWidth}>
        {showLeft && (
          <Panel order={1}>
            <MainPanelPane pane={left} {...props} />
          </Panel>
        )}
        {showRight && (
          <>
            <VerticalResizeHandle />
            <Panel order={2}>
              <MainPanelPane pane={right} {...props} />
            </Panel>
          </>
        )}
      </PanelGroup>
    </>
  );
}

interface MainPanelPaneProps {
  pane: PaneContent;
}

export function MainPanelPane({ pane, pdfViewerRef }: MainPanelPaneProps & MainPanelProps) {
  const { files, activeFile, activeFileContent } = pane;
  const items = files.map(({ fileId, fileName }) => ({
    key: fileId,
    text: fileName,
    value: fileId,
  }));

  const selectFileInPane = useSetAtom(selectFileInPaneAtom);
  const closeFileInPane = useSetAtom(closeFileFromPaneAtom);
  const focusPane = useSetAtom(focusPaneAtom);

  return (
    <div
      className="h-full grid-cols-1 grid-rows-[auto_1fr]"
      onClick={() => focusPane(pane.id)}
      onFocus={() => focusPane(pane.id)}
    >
      <TabPane
        items={items}
        value={activeFile}
        onClick={(file) => selectFileInPane({ paneId: pane.id, fileId: file })}
        onCloseClick={(path) => closeFileInPane({ paneId: pane.id, fileId: path })}
      />
      <div className="flex h-full w-full overflow-hidden">
        {activeFile && activeFileContent ? (
          <MainPaneViewContent activeFileAtom={activeFileContent} fileId={activeFile} pdfViewerRef={pdfViewerRef} />
        ) : (
          <EmptyView />
        )}
      </div>
    </div>
  );
}

interface MainPaneViewContentProps {
  activeFileAtom: Atom<Loadable<FileContent>>;
  fileId: FileId;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPaneViewContent({ activeFileAtom, pdfViewerRef }: MainPaneViewContentProps) {
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
      return <TipTapView file={data} />;
    case 'reference':
      return <ReferenceView referenceId={data.referenceId} />;
    default: {
      assertNever(data);
      return null;
    }
  }
}
