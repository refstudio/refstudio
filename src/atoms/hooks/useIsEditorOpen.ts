import { EditorContentType } from '../types/EditorContent';
import { parseEditorId } from '../types/EditorData';
import { useActiveEditorId } from './useActiveEditorId';

export function useIsEditorOpen({ type }: { type?: EditorContentType }) {
  const activeEditorId = useActiveEditorId();

  return activeEditorId && (!type || parseEditorId(activeEditorId).type === type);
}
