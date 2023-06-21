import { TipTapFileContent } from '../atoms/types/FileContent';
import { TipTapEditor } from '../editor/TipTapEditor';

export function TipTapView({ file }: { file: TipTapFileContent }) {
  return <TipTapEditor editorContent={file.textContent} />;
}
