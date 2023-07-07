import { useAtomValue, useSetAtom } from 'jotai';

import { activeEditorIdAtom } from '../../../atoms/core/activePane';
import { TextEditorContent } from '../../../atoms/types/EditorContent';
import { EditorContentAtoms } from '../../../atoms/types/EditorContentAtoms';
import { TipTapEditor } from '../components/TipTapEditor';

interface TipTapViewProps {
  file: TextEditorContent;
  activeEditorContentAtoms: EditorContentAtoms;
}

export function TipTapView({ file, activeEditorContentAtoms }: TipTapViewProps) {
  const { editorIdAtom, updateEditorContentBufferAtom, saveEditorContentInMemoryAtom } = activeEditorContentAtoms;

  const updateFileBuffer = useSetAtom(updateEditorContentBufferAtom);
  const saveFileInMemory = useSetAtom(saveEditorContentInMemoryAtom);

  const editorId = useAtomValue(editorIdAtom);
  const activeEditorId = useAtomValue(activeEditorIdAtom);

  return (
    <TipTapEditor
      editorContent={file.textContent}
      isActive={editorId === activeEditorId}
      saveFileInMemory={saveFileInMemory}
      updateFileBuffer={updateFileBuffer}
    />
  );
}
