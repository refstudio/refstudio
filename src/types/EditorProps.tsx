import { EditorAPI } from './EditorAPI';

export interface EditorProps {
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  onSelectionChange(text: string): void;
}
