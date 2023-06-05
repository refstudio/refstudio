import { FileEntry } from '@tauri-apps/api/fs';
import { useCallback } from 'react';

import { readFileEntryAsText } from '../filesystem';
import { usePromise } from '../hooks/usePromise';
import { TipTapEditor } from '../TipTapEditor/TipTapEditor';
import { EditorAPI } from '../types/EditorAPI';

export function TipTapView({
  file,
  editorRef,
}: {
  file: FileEntry;
  editorRef: React.MutableRefObject<EditorAPI | null>;
}) {
  const loadFile = useCallback(() => readFileEntryAsText(file), [file]);
  const loadFileState = usePromise(loadFile);

  if (loadFileState.state === 'loading') {
    return <strong>Loading ...</strong>;
  }

  if (loadFileState.state === 'error') {
    return <strong>Error: {String(loadFileState.error)}</strong>;
  }

  return <TipTapEditor editorContent={loadFileState.data} editorRef={editorRef} />;
}
