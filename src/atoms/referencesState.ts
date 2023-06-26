import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { ReferenceItem } from '../types/ReferenceItem';

type ReferencesState = Record<string, ReferenceItem>;

/** INTERNAL ATOMS */
// This is the internal representation of the references and is not exposed so that all business logic lives in this file to enable us to easily change the structure and/or switch to another state management library
const referencesAtom = atomWithStorage<ReferencesState>('references', {});

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
