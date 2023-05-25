import { EditorAPI } from './EditorAPI';

export interface EditorProps {
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  editorContent: string | null;
}
