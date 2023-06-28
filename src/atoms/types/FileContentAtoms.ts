import { Atom, WritableAtom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { FileContent } from './FileContent';

export interface FileContentAtoms {
  /** Read-only atom that contains the loadable file content */
  loadableFileAtom: Atom<Loadable<FileContent>>;
  /** Write-only atom to update the file buffer */
  updateFileBufferAtom: WritableAtom<null, [FileContent], void>;
  /** Write-only atom that saves the current file buffer */
  saveFileInMemoryAtom: WritableAtom<null, [], void>;
  /** Write-only atom that writes the content of the file buffer to the disk */
  saveFileAtom: WritableAtom<null, [], Promise<void>>;
}
