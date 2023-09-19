import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

import { writeFileContent } from '../../io/filesystem';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { EditorContent } from '../types/EditorContent';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { EditorId, parseEditorId } from '../types/EditorData';
import { editorsDataAtom, setEditorDataIsDirtyAtom } from './editorData';

export function createEditorContentAtoms(
  editorId: EditorId,
  initialContent: EditorContent | Promise<EditorContent>,
): EditorContentAtoms {
  const editorAtom = atom(initialContent);
  const editorIdAtom = atom(editorId);
  const editorBufferAtom = atom<EditorContent | null>(initialContent instanceof Promise ? null : initialContent);

  const loadableEditorContentAtom = loadable(editorAtom);

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
        case 'refstudio': {
          const currentEditorId = get(editorIdAtom);
          const { id: path } = parseEditorId(currentEditorId);

          const success = await writeFileContent(path, JSON.stringify(editorContent.jsonContent));
          if (success) {
            set(setEditorDataIsDirtyAtom, { editorId: currentEditorId, isDirty: false });
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

  let saveTimeoutId: NodeJS.Timeout | null = null;

  const updateEditorContentBufferAtom = atom(null, (get, set, payload: EditorContent) => {
    set(editorBufferAtom, payload);
    set(setEditorDataIsDirtyAtom, { editorId: get(editorIdAtom), isDirty: true });

    // Debounced auto-save of editor content
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    saveTimeoutId = setTimeout(() => {
      const editorData = get(editorsDataAtom).get(editorId);
      if (!editorData) {
        console.log('Editor data not found, cannot save editor content');
        return;
      }
      if (!editorData.isDirty) {
        console.log('Editor content is not dirty, no need to save');
        return;
      }
      set(saveEditorContentAtom)
        .catch((error) => {
          console.error('Error while saving editor content', error);
        })
        .finally(() => {
          saveTimeoutId = null;
        });
    }, 500);
  });

  return {
    editorIdAtom,
    loadableEditorContentAtom,
    updateEditorContentBufferAtom,
    saveEditorContentInMemoryAtom,
    saveEditorContentAtom,
  };
}
