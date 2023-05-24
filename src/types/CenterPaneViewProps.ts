import { FileEntry } from '@tauri-apps/api/fs';

import { EditorAPI } from './EditorAPI';

export interface CenterPaneViewProps {
  editorRef: React.MutableRefObject<EditorAPI | undefined>;
  file?: FileEntry;
  onSelectionChange(text: string): void;
}
