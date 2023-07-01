import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { selectEditorInPaneAtom } from '../../atoms/editorActions';
import { focusPaneAtom, leftPaneAtom, rightPaneAtom } from '../../atoms/paneActions';
import { EditorContentAtoms } from '../../atoms/types/EditorContentAtoms';
import { PaneContent } from '../../atoms/types/PaneGroup';
import { Spinner } from '../../components/Spinner';
import { TabPane } from '../../components/TabPane';
import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { emitEvent } from '../../events';
import { ReferencesTableView } from '../../features/references/editor/ReferencesTableView';
import { ReferenceView } from '../../features/references/editor/ReferenceView';
import { TipTapView } from '../../features/textEditor/editor/TipTapView';
import { assertNever } from '../../lib/assertNever';
import { PdfViewerAPI } from '../../types/PdfViewerAPI';
import { EmptyView } from '../views/EmptyView';
import { PdfViewer } from '../views/PdfViewer';
import { TextView } from '../views/TextView';

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

  const showRight = right.openEditors.length > 0;
  const showLeft = left.openEditors.length > 0 || !showRight;

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
  const { openEditors, activeEditor: activeFile, activeEditor } = pane;
  const activeEditorAtoms = activeEditor?.contentAtoms;

  const items = openEditors.map(({ id: editorId, title, isDirty }) => ({
    text: title,
    value: editorId,
    isDirty,
  }));

  const selectFileInPane = useSetAtom(selectEditorInPaneAtom);
  const focusPane = useSetAtom(focusPaneAtom);

  return (
    <div className="flex h-full flex-col" onClick={() => focusPane(pane.id)} onFocus={() => focusPane(pane.id)}>
      <div className="grow-0">
        <TabPane
          items={items}
          value={activeFile?.id}
          onClick={(editorId) => selectFileInPane({ paneId: pane.id, editorId })}
          onCloseClick={(editorId) => emitEvent('refstudio://editors/close', { paneId: pane.id, editorId })}
        />
      </div>
      <div className="flex w-full grow overflow-hidden">
        {activeEditorAtoms ? (
          <MainPaneViewContent activeEditorAtoms={activeEditorAtoms} pdfViewerRef={pdfViewerRef} />
        ) : (
          <EmptyView />
        )}
      </div>
    </div>
  );
}

interface MainPaneViewContentProps {
  activeEditorAtoms: EditorContentAtoms;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPaneViewContent({ activeEditorAtoms, pdfViewerRef }: MainPaneViewContentProps) {
  const { loadableEditorContentAtom } = activeEditorAtoms;
  const loadableFileContent = useAtomValue(loadableEditorContentAtom);

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
    case 'text':
      return <TipTapView activeEditorContentAtoms={activeEditorAtoms} file={data} />;
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
