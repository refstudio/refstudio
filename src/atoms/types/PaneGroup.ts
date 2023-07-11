import { EditorContentAtoms } from './EditorContentAtoms';
import { EditorData, EditorId } from './EditorData';

export type PaneId = 'LEFT' | 'RIGHT';

export interface PaneEditorId {
  paneId: PaneId;
  editorId: EditorId;
}
export interface PaneState {
  openEditorIds: EditorId[];
  activeEditorId?: EditorId;
}

export interface PaneContent {
  id: PaneId;
  openEditors: EditorData[];
  activeEditor?: { id: EditorId; contentAtoms: EditorContentAtoms };
}

export type PaneGroupState = Record<PaneId, PaneState>;
