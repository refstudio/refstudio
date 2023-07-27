import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';

import { useActiveEditorId } from '../../../atoms/hooks/useActiveEditorId';
import { RefStudioEditorContent } from '../../../atoms/types/EditorContent';
import { EditorContentAtoms } from '../../../atoms/types/EditorContentAtoms';
import { TipTapEditor } from '../components/TipTapEditor';

interface TipTapViewProps {
  file: RefStudioEditorContent;
  activeEditorContentAtoms: EditorContentAtoms;
}

export function TipTapView({ file, activeEditorContentAtoms }: TipTapViewProps) {
  const { editorIdAtom, updateEditorContentBufferAtom, saveEditorContentInMemoryAtom } = activeEditorContentAtoms;

  const updateFileBuffer = useSetAtom(updateEditorContentBufferAtom);
  const saveFileInMemory = useSetAtom(saveEditorContentInMemoryAtom);

  const editorId = useAtomValue(editorIdAtom);
  const activeEditorId = useActiveEditorId();

  const editorContent = useMemo(() => file.jsonContent, [file]);

  return (
    <TipTapEditor
      editorContent={editorContent}
      isActive={editorId === activeEditorId}
      saveFileInMemory={saveFileInMemory}
      updateFileBuffer={updateFileBuffer}
    />
  );
}
