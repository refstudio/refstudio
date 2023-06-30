import { Atom, WritableAtom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { EditorContent } from './EditorContent';

export interface EditorContentAtoms {
  /** Read-only atom that contains the loadable editor content */
  loadableEditorContentAtom: Atom<Loadable<EditorContent>>;
  /** Write-only atom to update the editor content buffer */
  updateEditorContentBufferAtom: WritableAtom<null, [EditorContent], void>;
  /** Write-only atom that saves the current editor content buffer to memory */
  saveEditorContentInMemoryAtom: WritableAtom<null, [], void>;
  /** Write-only atom that writes the content of the editor content buffer to a persistent storage */
  saveEditorContentAtom: WritableAtom<null, [], Promise<void>>;
}
