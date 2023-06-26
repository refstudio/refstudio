import { Atom, WritableAtom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { FileContent } from './FileContent';

export interface FileContentAtoms {
  loadableFileAtom: Atom<Loadable<FileContent>>;
  updateFileBufferAtom: WritableAtom<null, [FileContent], void>;
  saveFileInMemoryAtom: WritableAtom<null, [], void>;
}
