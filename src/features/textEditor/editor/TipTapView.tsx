import { TextEditorContent } from '../../../atoms/types/EditorContent';
import { EditorContentAtoms } from '../../../atoms/types/EditorContentAtoms';
import { TipTapEditor } from '../components/TipTapEditor';

interface TipTapViewProps {
  file: TextEditorContent;
  activeEditorContentAtoms: EditorContentAtoms;
}

export function TipTapView({ file, activeEditorContentAtoms }: TipTapViewProps) {
  return <TipTapEditor activeEditorContentAtoms={activeEditorContentAtoms} editorContent={file.textContent} />;
}
