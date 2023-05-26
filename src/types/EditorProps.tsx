import { EditorAPI } from './EditorAPI';

export interface EditorProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  editorContent: string | null
  onSelectionChange(text: string): void;
}
