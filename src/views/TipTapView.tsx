import { TipTapFileContent } from '../atoms/types/FileContent';
import { FileContentAtoms } from '../atoms/types/FileContentAtoms';
import { TipTapEditor } from '../editor/TipTapEditor';

interface TipTapViewProps {
  file: TipTapFileContent;
  activeFileAtoms: FileContentAtoms;
}

export function TipTapView({ file, activeFileAtoms }: TipTapViewProps) {
  return <TipTapEditor activeFileAtoms={activeFileAtoms} editorContent={file.content} />;
}
