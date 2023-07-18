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
import { emitEvent } from '../../events';
import { ReferencesTableView } from '../../features/references/editor/ReferencesTableView';
import { ReferenceView } from '../../features/references/editor/ReferenceView';
import { TipTapView } from '../../features/textEditor/editor/TipTapView';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { assertNever } from '../../lib/assertNever';
import { PdfViewer } from '../views/PdfViewer';
import { TextView } from '../views/TextView';
import { WelcomeView } from '../views/WelcomeView';
import { OpenEditorsTabPane } from './OpenEditorsTabPane';

export function MainPanel() {
  const leftOpenEditorsCount = useOpenEditorsCountForPane('LEFT');
  const rightOpenEditorsCount = useOpenEditorsCountForPane('RIGHT');

  const showRight = rightOpenEditorsCount > 0;
  const showLeft = leftOpenEditorsCount > 0 || !showRight;

  const handleLayoutUpdate = useDebouncedCallback(
    useCallback(() => emitEvent('refstudio://layout/update'), []),
    200,
  );

  return (
    <PanelGroup autoSaveId="mainPanel" direction="horizontal" onLayout={handleLayoutUpdate}>
      {showLeft && (
        <Panel order={1}>
          <MainPanelPane paneId="LEFT" />
        </Panel>
      )}
      {showLeft && showRight && <VerticalResizeHandle />}
      {showRight && (
        <Panel order={2}>
          <MainPanelPane paneId="RIGHT" />
        </Panel>
      )}
    </PanelGroup>
  );
}

interface MainPanelPaneProps {
  paneId: PaneId;
}

const MainPanelPane = memo(({ paneId }: MainPanelPaneProps) => {
  const activeEditorAtoms = useActiveEditorContentAtomsForPane(paneId);

  const focusPane = useSetAtom(focusPaneAtom);

  return (
    <div className="flex h-full flex-col" onClick={() => focusPane(paneId)} onFocus={() => focusPane(paneId)}>
      <div className="grow-0">
        <OpenEditorsTabPane paneId={paneId} />
      </div>
      <div className="flex w-full grow overflow-hidden">
        {activeEditorAtoms ? <MainPaneViewContent activeEditorAtoms={activeEditorAtoms} /> : <WelcomeView />}
      </div>
    </div>
  );
});
MainPanelPane.displayName = 'MainPanelPane';

interface MainPaneViewContentProps {
  activeEditorAtoms: EditorContentAtoms;
}

function MainPaneViewContent({ activeEditorAtoms }: MainPaneViewContentProps) {
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
      return <PdfViewer file={data} />;
    case 'text':
      return <TipTapView activeEditorContentAtoms={activeEditorAtoms} file={data} />;
    case 'reference':
      return <ReferenceView referenceId={data.referenceId} />;
    case 'references':
      return <ReferencesTableView defaultFilter={data.filter} />;
    default: {
      assertNever(data);
    }
  }
}
