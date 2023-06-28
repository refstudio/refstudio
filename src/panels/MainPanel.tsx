import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import {
  closeFileFromPaneAtom,
  focusPaneAtom,
  leftPaneAtom,
  rightPaneAtom,
  selectFileInPaneAtom,
} from '../atoms/fileActions';
import { FileContentAtoms } from '../atoms/types/FileContentAtoms';
import { FileId } from '../atoms/types/FileData';
import { PaneContent } from '../atoms/types/PaneGroup';
import { Spinner } from '../components/Spinner';
import { TabPane } from '../components/TabPane';
import { VerticalResizeHandle } from '../components/VerticalResizeHandle';
import { assertNever } from '../lib/assertNever';
import { ReferencesTableView } from '../references/editor/ReferencesTableView';
import { ReferenceView } from '../references/editor/ReferenceView';
import { PdfViewerAPI } from '../types/PdfViewerAPI';
import { EmptyView } from '../views/EmptyView';
import { PdfViewer } from '../views/PdfViewer';
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
    <PanelGroup autoSaveId="mainPanel" direction="horizontal" onLayout={updatePDFViewerWidth}>
      {showLeft && (
        <Panel order={1}>
          <MainPanelPane pane={left} {...props} />
        </Panel>
      )}
      {showLeft && showRight && <VerticalResizeHandle />}
      {showRight && (
        <Panel order={2}>
          <MainPanelPane pane={right} {...props} />
        </Panel>
      )}
    </PanelGroup>
  );
}

interface MainPanelPaneProps {
  pane: PaneContent;
}

export function MainPanelPane({ pane, pdfViewerRef }: MainPanelPaneProps & MainPanelProps) {
  const { files, activeFile, activeFileAtoms } = pane;
  const items = files.map(({ fileId, fileName, isDirty }) => ({
    key: fileId,
    text: fileName,
    value: fileId,
    isDirty,
  }));

  const selectFileInPane = useSetAtom(selectFileInPaneAtom);
  const closeFileInPane = useSetAtom(closeFileFromPaneAtom);
  const focusPane = useSetAtom(focusPaneAtom);

  return (
    <div className="flex h-full flex-col" onClick={() => focusPane(pane.id)} onFocus={() => focusPane(pane.id)}>
      <div className="grow-0">
        <TabPane
          items={items}
          value={activeFile}
          onClick={(file) => selectFileInPane({ paneId: pane.id, fileId: file })}
          onCloseClick={(path) => closeFileInPane({ paneId: pane.id, fileId: path })}
        />
      </div>
      <div className="flex w-full grow overflow-hidden">
        {activeFile && activeFileAtoms ? (
          <MainPaneViewContent activeFileAtoms={activeFileAtoms} fileId={activeFile} pdfViewerRef={pdfViewerRef} />
        ) : (
          <EmptyView />
        )}
      </div>
    </div>
  );
}

interface MainPaneViewContentProps {
  activeFileAtoms: FileContentAtoms;
  fileId: FileId;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPaneViewContent({ activeFileAtoms, pdfViewerRef }: MainPaneViewContentProps) {
  const { loadableFileAtom } = activeFileAtoms;
  const loadableFileContent = useAtomValue(loadableFileAtom);

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
      return <TipTapView activeFileAtoms={activeFileAtoms} file={data} />;
    case 'reference':
      return <ReferenceView referenceId={data.referenceId} />;
    case 'references':
      return <ReferencesTableView />;
    default: {
      assertNever(data);
      return null;
    }
  }
}
