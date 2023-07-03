import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

import { writeFileContent } from '../../io/filesystem';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { EditorContent } from '../types/EditorContent';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { EditorId, parseEditorId } from '../types/EditorData';
import { setEditorDataIsDirtyAtom } from './editorData';

export function createEditorContentAtoms(
  editorId: EditorId,
  initialContent: EditorContent | Promise<EditorContent>,
): EditorContentAtoms {
  const editorAtom = atom(initialContent);
  const editorBufferAtom = atom<EditorContent | null>(initialContent instanceof Promise ? null : initialContent);

  const loadableEditorContentAtom = loadable(editorAtom);

  const updateEditorContentBufferAtom = atom(null, (_, set, payload: EditorContent) => {
    set(editorBufferAtom, payload);
    set(setEditorDataIsDirtyAtom, { editorId, isDirty: true });
  });

  const saveEditorContentInMemoryAtom = atom(null, (get, set) => {
    const editorContent = get(editorBufferAtom);
    if (editorContent) {
      set(editorAtom, editorContent);
    }
  });

  const saveEditorContentAtom = atom(null, async (get, set) => {
    const editorContent = get(editorBufferAtom);

    if (editorContent) {
      switch (editorContent.type) {
        case 'text': {
          const { type, id: path } = parseEditorId(editorId);
          if (type !== editorContent.type) {
            throw new Error(`Editor content type (${editorContent.type}) does not match expected type (${type})`);
          }

          const success = await writeFileContent(path, editorContent.textContent);
          if (success) {
            set(setEditorDataIsDirtyAtom, { editorId, isDirty: false });
            // Refresh file tree after saving file
            void set(refreshFileTreeAtom);
          }
          return;
        }
        default: {
          console.error('Save editor - Unsupported editor content type: ', editorContent.type);
          return;
        }
      }
    }
  });

  return {
    loadableEditorContentAtom,
    updateEditorContentBufferAtom,
    saveEditorContentInMemoryAtom,
    saveEditorContentAtom,
  };
}
