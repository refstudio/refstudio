import { EditorContentType } from './EditorContent';

export type EditorId = `refstudio://${EditorContentType}/${string}`;

export interface EditorData {
  id: EditorId;
  title: string;
  isDirty?: boolean;
}

export function parseEditorId(editorId: EditorId): { type: EditorContentType; id: string } {
  const [left, ...rest] = editorId.split('refstudio://');

  if (left.length !== 0 || rest.length !== 1) {
    throw new Error(`Invalid editor id: ${editorId}`);
  }

  const [type, ...id] = rest[0].split('/');

  return { type: type as EditorContentType, id: id.join('/') };
}

export function buildEditorId(type: 'references'): EditorId;
export function buildEditorId(type: Exclude<EditorContentType, 'references'>, id: string): EditorId;
export function buildEditorId(type: EditorContentType, id = ''): EditorId {
  return `refstudio://${type}/${id}`;
}
