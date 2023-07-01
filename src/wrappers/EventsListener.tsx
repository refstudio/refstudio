import { atom, useAtomValue, useSetAtom } from 'jotai';

import { activePaneAtom, closeEditorFromPaneAtom } from '../atoms/editorActions';
import { activePaneContentAtom } from '../atoms/paneActions';
import { PaneEditorId } from '../atoms/types/PaneGroup';
import { emitEvent } from '../events';
import { useListenEvent } from '../hooks/useListenEvent';
import { asyncNoop, noop } from '../lib/noop';

export function EventsListener({ children }: { children?: React.ReactNode }) {
  const saveActiveFile = useSaveActiveFile();
  const closeActiveEditor = useCloseActiveEditor();
  const closeEditor = useCloseEditor();

  useListenEvent('refstudio://menu/file/save', saveActiveFile);
  useListenEvent('refstudio://menu/file/close', closeActiveEditor);
  useListenEvent('refstudio://editors/close', closeEditor);

  return <>{children}</>;
}

function useSaveActiveFile() {
  const activePaneContent = useAtomValue(activePaneContentAtom);
  const saveFile = useSetAtom(
    activePaneContent.activeEditor?.contentAtoms.saveEditorContentAtom ?? atom(null, asyncNoop),
  );

  return () => void saveFile();
}

function useCloseActiveEditor() {
  const activePane = useAtomValue(activePaneAtom);

  if (!activePane.activeEditorId) {
    return noop;
  }

  const editorId = activePane.activeEditorId;
  const paneId = activePane.id;

  return () => emitEvent('refstudio://editors/close', { editorId, paneId });
}

function useCloseEditor() {
  const closeEditorFromPane = useSetAtom(closeEditorFromPaneAtom);

  return (paneEditorId: PaneEditorId) => closeEditorFromPane(paneEditorId);
}
