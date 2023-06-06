
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';
import { TipTapFileContent } from '../types/FileContent';

export function TipTapView({
  editorRef,
  file,
}: {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  file: TipTapFileContent;
}) {
  return <TipTapEditor editorContent={file.textContent} editorRef={editorRef} />;
}
