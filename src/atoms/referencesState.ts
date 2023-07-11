import { atom } from 'jotai';

import { removeReferences, updateReference } from '../api/ingestion';
import { deleteFile } from '../io/filesystem';
import { isNonNullish } from '../lib/isNonNullish';
import { ReferenceItem } from '../types/ReferenceItem';
import { closeEditorFromAllPanesAtom } from './editorActions';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { buildEditorId } from './types/EditorData';

type ReferencesState = Record<string, ReferenceItem>;

/** INTERNAL ATOMS */
// This is the internal representation of the references and is not exposed so that all business logic lives in this file to enable us to easily change the structure and/or switch to another state management library
const referencesAtom = atom<ReferencesState>({});

/** EXTERNAL ATOMS */
export const getReferencesAtom = atom((get) => Object.values(get(referencesAtom)));

export const getDerivedReferenceAtom = (referenceId: string) =>
  atom<ReferenceItem | undefined>((get) => get(referencesAtom)[referenceId]);

export const setReferencesAtom = atom(null, (_get, set, references: ReferenceItem[]) => {
  const updatedReferences = {} as ReferencesState;
  references.forEach((reference) => {
    updatedReferences[reference.id] = reference;
  });
  set(referencesAtom, updatedReferences);
});

export const referencesSyncInProgressAtom = atom<boolean>(false);

const removeReferenceAtom = atom(null, (get, set, id: string) => {
  const references = get(getReferencesAtom);
  const newReferences = references.filter((ref) => ref.id !== id);
  set(setReferencesAtom, newReferences);
});

const UPDATABLE_FIELDS: (keyof ReferenceItem)[] = ['citationKey', 'title', 'publishedDate', 'authors'];
export const updateReferenceAtom = atom(null, async (get, set, id: string, updatedReference: ReferenceItem) => {
  const reference = get(getDerivedReferenceAtom(id));
  if (!reference) {
    console.warn('Cannot find reference with ID', id);
    return;
  }

  const patch: Partial<ReferenceItem> = UPDATABLE_FIELDS.reduce(
    (acc, field) => ({
      ...acc,
      ...patchEntry(field, reference, updatedReference),
    }),
    {},
  );

  if (Object.keys(patch).length === 0) {
    console.log('No change detected.');
    return;
  }

  // Call backend (patch of updatable fields)
  await updateReference(reference.filename, patch);

  // Update local atoms
  const references = get(getReferencesAtom);
  const updatedReferences = {} as ReferencesState;
  references.forEach((ref) => {
    updatedReferences[ref.id] = ref.id === updatedReference.id ? updatedReference : ref;
  });
  set(referencesAtom, updatedReferences);
});

function patchEntry(key: keyof ReferenceItem, original: ReferenceItem, updated: ReferenceItem): Partial<ReferenceItem> {
  const originalValue = original[key];
  const updatedValue = updated[key];
  console.log('values', key, originalValue, updatedValue);

  if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
    return { [key]: updatedValue };
  }
  return {};
}

export const removeReferencesAtom = atom(null, async (get, set, ids: string[]) => {
  const referencesToRemove = ids.map((id) => get(getDerivedReferenceAtom(id))).filter(isNonNullish);

  // Close any open editor with references (details or pdf) about to be removed
  referencesToRemove.forEach((reference) => {
    const editorId = buildEditorId('reference', reference.id);
    set(closeEditorFromAllPanesAtom, editorId);
    const editorPdfId = buildEditorId('pdf', reference.filepath);
    set(closeEditorFromAllPanesAtom, editorPdfId);
  });

  // Remove references from BE
  await removeReferences(referencesToRemove.map((ref) => ref.filename));

  // Remove files from filesystem
  const success = await Promise.all(referencesToRemove.map((reference) => deleteFile(reference.filepath)));
  if (success.some((s) => !s)) {
    console.warn('Error deleting some files');
  }

  // Update visible references
  referencesToRemove.forEach((reference) => set(removeReferenceAtom, reference.id));

  // Refresh file explorer
  await set(refreshFileTreeAtom);
});
