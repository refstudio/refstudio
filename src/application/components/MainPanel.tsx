import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useActiveEditorContentAtomsForPane } from '../../atoms/hooks/useActiveEditorContentAtomsForPane';
import { useOpenEditorsCountForPane } from '../../atoms/hooks/useOpenEditorsCountForPane';
import { focusPaneAtom } from '../../atoms/paneActions';
import { EditorContentAtoms } from '../../atoms/types/EditorContentAtoms';
import { PaneId } from '../../atoms/types/PaneGroup';
import { Spinner } from '../../components/Spinner';
import { VerticalResizeHandle } from '../../components/VerticalResizeHandle';
import { ReferencesTableView } from '../../features/references/editor/ReferencesTableView';
import { ReferenceView } from '../../features/references/editor/ReferenceView';
import { TipTapView } from '../../features/textEditor/editor/TipTapView';
import { assertNever } from '../../lib/assertNever';
import { PdfViewerAPI } from '../../types/PdfViewerAPI';
import { EmptyView } from '../views/EmptyView';
import { PdfViewer } from '../views/PdfViewer';
import { TextView } from '../views/TextView';
import { OpenEditorsTabPane } from './OpenEditorsTabPane';

interface MainPanelProps {
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

export function MainPanel(props: MainPanelProps) {
  const { pdfViewerRef } = props;
  const leftOpenEditorsCount = useOpenEditorsCountForPane('LEFT');
  const rightOpenEditorsCount = useOpenEditorsCountForPane('RIGHT');

  const updatePDFViewerWidth = useCallback(() => {
    pdfViewerRef.current?.updateWidth();
  }, [pdfViewerRef]);

  const showRight = rightOpenEditorsCount > 0;
  const showLeft = leftOpenEditorsCount > 0 || !showRight;

  return (
    <PanelGroup autoSaveId="mainPanel" direction="horizontal" onLayout={updatePDFViewerWidth}>
      {showLeft && (
        <Panel order={1}>
          <MainPanelPane paneId="LEFT" {...props} />
        </Panel>
      )}
      {showLeft && showRight && <VerticalResizeHandle />}
      {showRight && (
        <Panel order={2}>
          <MainPanelPane paneId="RIGHT" {...props} />
        </Panel>
      )}
    </PanelGroup>
  );
}

interface MainPanelPaneProps {
  paneId: PaneId;
}

const MainPanelPane = memo(({ paneId, pdfViewerRef }: MainPanelPaneProps & MainPanelProps) => {
  const activeEditorAtoms = useActiveEditorContentAtomsForPane(paneId);

  const focusPane = useSetAtom(focusPaneAtom);

  return (
    <div className="flex h-full flex-col" onClick={() => focusPane(paneId)} onFocus={() => focusPane(paneId)}>
      <div className="grow-0">
        <OpenEditorsTabPane paneId={paneId} />
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
});
MainPanelPane.displayName = 'MainPanelPane';

interface MainPaneViewContentProps {
  activeEditorAtoms: EditorContentAtoms;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
}

function MainPaneViewContent({ activeEditorAtoms, pdfViewerRef }: MainPaneViewContentProps) {
  const { loadableEditorContentAtom } = activeEditorAtoms;
  const loadableEditorContent = useAtomValue(loadableEditorContentAtom);

  if (loadableEditorContent.state === 'loading') {
    return <Spinner />;
  }

  if (loadableEditorContent.state === 'hasError') {
    return <strong>Error: {String(loadableEditorContent.error)}</strong>;
  }

  const { data } = loadableEditorContent;

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
      return <ReferencesTableView defaultFilter={data.filter} />;
    default: {
      assertNever(data);
      return null;
    }
  }
}
