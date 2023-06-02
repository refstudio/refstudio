import { atom } from 'jotai';

import { ReferenceItem } from '../types/ReferenceItem';

const pdfIngestionProcessAtom = atom<string[]>([]); // ids of pending processes for now, this could be a record with progress percentage in the future

export const isPdfIngestionRunningAtom = atom((get) => get(pdfIngestionProcessAtom).length > 0);

export const addPdfIngestionProcessAtom = atom(null, (_get, set, value: string) => {
  set(pdfIngestionProcessAtom, (pendingProcesses) => [...pendingProcesses, value]);
});

export const removePdfIngestionProcessAtom = atom(null, (_get, set, value: string) => {
  set(pdfIngestionProcessAtom, (pendingProcesses) => pendingProcesses.filter((processId) => processId !== value));
});

type ReferencesState = Record<string, ReferenceItem>;

const referencesAtom = atom<ReferencesState>({});

export const getReferencesAtom = atom((get) => Object.values(get(referencesAtom)));

export const getDerivedReferenceAtom = (referenceId: string) => atom((get) => get(referencesAtom)[referenceId]);

export const setReferencesAtom = atom(null, (_get, set, references: ReferenceItem[]) => {
  const updatedReferences = {} as ReferencesState;
  references.forEach((reference) => {
    updatedReferences[reference.id] = reference;
  });
  set(referencesAtom, updatedReferences);
});
