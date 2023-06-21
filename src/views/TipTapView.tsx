import { TipTapFileContent } from '../atoms/types/FileContent';
import { TipTapEditor } from '../editor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';

export function TipTapView({
  editorRef,
  file,
}: {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  file: TipTapFileContent;
}) {
  return <TipTapEditor editorContent={file.textContent} editorRef={editorRef} />;
}
