import { EditorContentType } from './EditorContent';
import { getFileFileEntryFromPath } from './FileEntry';

export type EditorIdFor<T extends EditorContentType> = `refstudio://${T}/${string}`;
export type EditorId = EditorIdFor<EditorContentType>;

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

export function buildEditorId(type: 'references'): EditorIdFor<'references'>;
export function buildEditorId<T extends Exclude<EditorContentType, 'references'>>(type: T, id: string): EditorIdFor<T>;
export function buildEditorId<T extends EditorContentType>(type: T, id = ''): EditorIdFor<T> {
  return `refstudio://${type}/${id}`;
}

export function buildEditorIdFromPath(filePath: string) {
  const fileFileEntry = getFileFileEntryFromPath(filePath);
  let type: EditorContentType;
  switch (fileFileEntry.fileExtension) {
    case 'pdf':
    case 'json': {
      type = fileFileEntry.fileExtension;
      break;
    }
    case 'refstudio':
    case '': {
      type = 'refstudio';
      break;
    }
    default: {
      type = 'text';
      break;
    }
  }
  return buildEditorId(type, filePath);
}
