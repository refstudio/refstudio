import { atom, useAtomValue, useSetAtom } from 'jotai';

import { activePaneAtom, closeEditorFromPaneAtom } from '../atoms/editorActions';
import { createFileAtom, deleteFileAtom } from '../atoms/fileEntryActions';
import { activeEditorAtom } from '../atoms/paneActions';
import { removeReferencesAtom } from '../atoms/referencesState';
import { PaneEditorId } from '../atoms/types/PaneGroup';
import { emitEvent } from '../events';
import { useLoadReferencesListener } from '../features/references/eventListeners';
import { useListenEvent } from '../hooks/useListenEvent';
import { asyncNoop, noop } from '../lib/noop';
import { useClearNotificationsListener, useCreateNotificationListener } from '../notifications/eventListeners';

export function EventsListener({ children }: { children?: React.ReactNode }) {
  const saveActiveFile = useSaveActiveFileListener();
  const closeActiveEditor = useCloseActiveEditorListener();
  const closeEditor = useCloseEditorListener();
  const createFile = useCreateFileListener();
  const removeReferences = useRemoveReferencesListener();
  const deleteFile = useDeleteFileListener();
  const createNotificationListener = useCreateNotificationListener();
  const clearNotificationsListener = useClearNotificationsListener();
  const loadReferencesListener = useLoadReferencesListener();

  useListenEvent('refstudio://menu/file/save', saveActiveFile);
  useListenEvent('refstudio://menu/file/close', closeActiveEditor);
  useListenEvent('refstudio://menu/file/new', createFile);
  useListenEvent('refstudio://editors/close', closeEditor);
  useListenEvent('refstudio://references/remove', removeReferences);
  useListenEvent('refstudio://explorer/delete', deleteFile);
  useListenEvent('refstudio://notifications/new', createNotificationListener);
  useListenEvent('refstudio://notifications/clear', clearNotificationsListener);
  useListenEvent('refstudio://references/load', loadReferencesListener);

  return <>{children}</>;
}

function useSaveActiveFileListener() {
  const activeEditor = useAtomValue(activeEditorAtom);
  const saveFile = useSetAtom(activeEditor?.contentAtoms.saveEditorContentAtom ?? atom(null, asyncNoop));

  return () => void saveFile();
}

function useCreateFileListener() {
  const createFile = useSetAtom(createFileAtom);

  return () => createFile();
}

function useCloseActiveEditorListener() {
  const activePane = useAtomValue(activePaneAtom);

  if (!activePane.activeEditorId) {
    return noop;
  }

  const editorId = activePane.activeEditorId;
  const paneId = activePane.id;

  return () => emitEvent('refstudio://editors/close', { editorId, paneId });
}

function useCloseEditorListener() {
  const closeEditorFromPane = useSetAtom(closeEditorFromPaneAtom);

  return (paneEditorId: PaneEditorId) => closeEditorFromPane(paneEditorId);
}

function useRemoveReferencesListener() {
  const removeReferences = useSetAtom(removeReferencesAtom);
  return ({ referenceIds }: { referenceIds: string[] }) => void removeReferences(referenceIds);
}

function useDeleteFileListener() {
  const deleteFile = useSetAtom(deleteFileAtom);

  return ({ path }: { path: string }) => void deleteFile(path);
}
