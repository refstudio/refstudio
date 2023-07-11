import { EditorId } from './EditorData';

export type PaneId = 'LEFT' | 'RIGHT';

export interface PaneEditorId {
  paneId: PaneId;
  editorId: EditorId;
}
export interface PaneState {
  openEditorIds: EditorId[];
  activeEditorId?: EditorId;
}

export type PaneGroupState = Record<PaneId, PaneState>;
