import { atom, useAtomValue, useSetAtom } from 'jotai';

import {
  activePaneAtom,
  closeAllEditorsAtom,
  closeEditorFromPaneAtom,
  moveEditorToPaneAtom,
} from '../atoms/editorActions';
import { createFileAtom, deleteFileAtom, renameFileAtom } from '../atoms/fileEntryActions';
import { fileExplorerEntryPathBeingRenamed } from '../atoms/fileExplorerActions';
import { useActiveEditorContentAtoms } from '../atoms/hooks/useActiveEditorContentAtoms';
import { removeReferencesAtom } from '../atoms/referencesState';
import { PaneEditorId } from '../atoms/types/PaneGroup';
import { emitEvent, RefStudioEventPayload } from '../events';
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
  // Menu > File
  useListenEvent('refstudio://menu/file/new', useCreateFileListener());
  useListenEvent('refstudio://menu/file/save', useSaveActiveFileListener());
  useListenEvent('refstudio://menu/file/close', useCloseActiveEditorListener());
  useListenEvent('refstudio://menu/file/close/all', useCloseAllActiveEditorsListener());
  // Editors
  useListenEvent('refstudio://editors/close', useCloseEditorListener());
  useListenEvent('refstudio://editors/move', useMoveActiveEditorToPaneListener());
  // Explorer
  useListenEvent('refstudio://explorer/rename', useRenameFileListener());
  useListenEvent('refstudio://explorer/delete', useDeleteFileListener());
  // References
  useListenEvent('refstudio://references/remove', useRemoveReferencesListener());
  // Notifications
  useListenEvent('refstudio://notifications/new', useCreateNotificationListener());
  useListenEvent('refstudio://notifications/clear', useClearNotificationsListener());
  // notifications popup
  useListenEvent('refstudio://notifications/popup/open', useShowNotificationsPopupListener());
  useListenEvent('refstudio://notifications/popup/close', useHideNotificationsPopupListener());
  // View
  useListenEvent('refstudio://menu/view/notifications', useTauriViewNotificationMenuListener());
  // Debug
  useListenEvent('refstudio://menu/debug/console/clear', useClearConsoleListener());

  return <>{children}</>;
}

function useSaveActiveFileListener() {
  const activeEditor = useActiveEditorContentAtoms();
  const saveFile = useSetAtom(activeEditor?.saveEditorContentAtom ?? atom(null, asyncNoop));

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

function useCloseAllActiveEditorsListener() {
  const closeAllEditors = useSetAtom(closeAllEditorsAtom);

  return () => closeAllEditors();
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

function useMoveActiveEditorToPaneListener() {
  const moveEditorToPane = useSetAtom(moveEditorToPaneAtom);

  // Note: Payload for .../left and .../right is the same
  return ({ fromPaneEditorId: editor, toPaneId }: RefStudioEventPayload<'refstudio://editors/move'>) => {
    moveEditorToPane({ editorId: editor.editorId, fromPaneId: editor.paneId, toPaneId });
  };
}

function useClearConsoleListener() {
  return () => {
    console.clear();
  };
}
