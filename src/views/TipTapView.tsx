import { TipTapFileContent } from '../atoms/types/FileContent';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';

export function TipTapView({ file }: { file: TipTapFileContent }) {
  return <TipTapEditor editorContent={file.textContent} />;
}
