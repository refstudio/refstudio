
import { useEffect } from 'react';

import { EditorContentType } from '../types/EditorContent';
import { parseEditorId } from '../types/EditorData';
import { useActiveEditorId } from './useActiveEditorId';

export function useIsEditorOpen({ type }: { type?: EditorContentType }) {
  const activeEditorId = useActiveEditorId();

  useEffect(() => {
    console.log('activeEditorId');
  }, [activeEditorId]);

  return activeEditorId && (!type || parseEditorId(activeEditorId).type === type);
}