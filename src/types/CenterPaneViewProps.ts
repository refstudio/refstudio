import { FileEntry } from '@tauri-apps/api/fs';

import { EditorAPI } from './EditorAPI';
import { PdfViewerAPI } from './PdfViewerAPI';

export interface CenterPaneViewProps {
  editorRef: React.MutableRefObject<EditorAPI | null>;
  pdfViewerRef: React.MutableRefObject<PdfViewerAPI | null>;
  file?: FileEntry;
}
