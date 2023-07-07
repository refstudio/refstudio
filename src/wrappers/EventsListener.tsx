import { atom, useAtomValue, useSetAtom } from 'jotai';

import { activePaneAtom, closeEditorFromPaneAtom } from '../atoms/editorActions';
import { createFileAtom, deleteFileAtom, renameFileAtom } from '../atoms/fileEntryActions';
import { fileExplorerEntryPathBeingRenamed } from '../atoms/fileExplorerActions';
import { activeEditorAtom } from '../atoms/paneActions';
import { removeReferencesAtom } from '../atoms/referencesState';
import { PaneEditorId } from '../atoms/types/PaneGroup';
import { emitEvent, RefStudioEventPayload } from '../events';
import { useListenEvent } from '../hooks/useListenEvent';
import { asyncNoop, noop } from '../lib/noop';

export function EventsListener({ children }: { children?: React.ReactNode }) {
  const saveActiveFile = useSaveActiveFile();
  const closeActiveEditor = useCloseActiveEditor();
  const closeEditor = useCloseEditor();
  const createFile = useCreateFile();
  const renameFile = useRenameFile();
  const removeReferences = useRemoveReferences();
  const deleteFile = useDeleteFile();

  useListenEvent('refstudio://menu/file/save', saveActiveFile);
  useListenEvent('refstudio://menu/file/close', closeActiveEditor);
  useListenEvent('refstudio://menu/file/new', createFile);
  useListenEvent('refstudio://editors/close', closeEditor);
  useListenEvent('refstudio://references/remove', removeReferences);
  useListenEvent('refstudio://explorer/rename', renameFile);
  useListenEvent('refstudio://explorer/delete', deleteFile);

  return <>{children}</>;
}

function useSaveActiveFile() {
  const activeEditor = useAtomValue(activeEditorAtom);
  const saveFile = useSetAtom(activeEditor?.contentAtoms.saveEditorContentAtom ?? atom(null, asyncNoop));

  return () => void saveFile();
}

function useCreateFile() {
  const createFile = useSetAtom(createFileAtom);

  return () => createFile();
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

function useRemoveReferences() {
  const removeReferences = useSetAtom(removeReferencesAtom);
  return ({ referenceIds }: { referenceIds: string[] }) => void removeReferences(referenceIds);
}

function useRenameFile() {
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

function useDeleteFile() {
  const deleteFile = useSetAtom(deleteFileAtom);

  return ({ path }: RefStudioEventPayload<'refstudio://explorer/delete'>) => void deleteFile(path);
}
