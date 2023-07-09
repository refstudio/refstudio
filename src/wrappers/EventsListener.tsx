import { atom, useAtomValue, useSetAtom } from 'jotai';

import { activePaneAtom, closeEditorFromPaneAtom } from '../atoms/editorActions';
import { createFileAtom, deleteFileAtom, renameFileAtom } from '../atoms/fileEntryActions';
import { fileExplorerEntryPathBeingRenamed } from '../atoms/fileExplorerActions';
import { activeEditorAtom } from '../atoms/paneActions';
import { removeReferencesAtom } from '../atoms/referencesState';
import { PaneEditorId } from '../atoms/types/PaneGroup';
import { emitEvent, RefStudioEventPayload } from '../events';
import { useLoadReferencesListener } from '../features/references/eventListeners';
import { useListenEvent } from '../hooks/useListenEvent';
import { asyncNoop, noop } from '../lib/noop';
import {
  useClearNotificationsListener,
  useCreateNotificationListener,
  useHideNotificationsPopupListener,
  useShowNotificationsPopupListener,
  useTauriViewNotificationMenuListener,
} from '../notifications/eventListeners';

export function EventsListener({ children }: { children?: React.ReactNode }) {
  const saveActiveFileListener = useSaveActiveFileListener();
  const closeActiveEditorListener = useCloseActiveEditorListener();
  const closeEditorListener = useCloseEditorListener();
  const createFileListener = useCreateFileListener();
  const removeReferencesListener = useRemoveReferencesListener();
  const renameFileListener = useRenameFileListener();
  const deleteFileListener = useDeleteFileListener();

  // Menu > File
  useListenEvent('refstudio://menu/file/save', saveActiveFileListener);
  useListenEvent('refstudio://menu/file/close', closeActiveEditorListener);
  useListenEvent('refstudio://menu/file/new', createFileListener);
  // Editors
  useListenEvent('refstudio://editors/close', closeEditorListener);
  // Explorer
  useListenEvent('refstudio://explorer/rename', renameFileListener);
  useListenEvent('refstudio://explorer/delete', deleteFileListener);
  // References
  useListenEvent('refstudio://references/remove', removeReferencesListener);
  useListenEvent('refstudio://references/load', useLoadReferencesListener());
  // Notifications
  useListenEvent('refstudio://notifications/new', useCreateNotificationListener());
  useListenEvent('refstudio://notifications/clear', useClearNotificationsListener());
  // notifications popup
  useListenEvent('refstudio://menu/view/notifications', useTauriViewNotificationMenuListener());
  useListenEvent('refstudio://notifications/popup/open', useShowNotificationsPopupListener());
  useListenEvent('refstudio://notifications/popup/close', useHideNotificationsPopupListener());

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

  return ({ path }: RefStudioEventPayload<'refstudio://explorer/delete'>) => void deleteFile(path);
}

function useRenameFileListener() {
  const markFilePathAsBeingRenamed = useSetAtom(fileExplorerEntryPathBeingRenamed);
  const renameFile = useSetAtom(renameFileAtom);

  return ({ path, newName }: RefStudioEventPayload<'refstudio://explorer/rename'>) => {
    if (!newName) {
      markFilePathAsBeingRenamed(path);
    } else {
      void renameFile({ filePath: path, newName });
    }
  };
}
