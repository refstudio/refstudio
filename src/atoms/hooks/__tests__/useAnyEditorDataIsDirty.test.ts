import { waitFor } from '@testing-library/react';
import { createStore } from 'jotai';

import { runHookWithJotaiProvider } from '../../__tests__/test-utils';
import { createEditorContentAtoms } from '../../core/createEditorContentAtoms';
import { editorsContentStateAtom } from '../../core/editorContent';
import { editorsDataAtom } from '../../core/editorData';
import { EditorContentAtoms } from '../../types/EditorContentAtoms';
import { buildEditorId, EditorId } from '../../types/EditorData';
import { useAnyEditorDataIsDirty } from '../useAnyEditorDataIsDirty';

describe('useAnyEditorDataIsDirty', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('refstudio', 'editor1');
  const editorId2 = buildEditorId('refstudio', 'editor2');

  const initialEditorsContent = new Map<EditorId, EditorContentAtoms>([
    [editorId1, createEditorContentAtoms(editorId1, { type: 'refstudio', jsonContent: { doc: '' } })],
    [editorId2, createEditorContentAtoms(editorId2, { type: 'refstudio', jsonContent: { doc: '' } })],
  ]);

  const initialEditorsData = new Map([
    [editorId1, { title: 'editor1', id: editorId1 }],
    [editorId2, { title: 'editor2', id: editorId2 }],
  ]);

  beforeEach(() => {
    store = createStore();
    store.set(editorsContentStateAtom, initialEditorsContent);

    store.set(editorsDataAtom, initialEditorsData);
  });

  it('should return false when no editor is dirty', () => {
    const { current } = runHookWithJotaiProvider(useAnyEditorDataIsDirty, store);
    expect(current).toBeFalsy();
  });

  it('should return true when one editor is edited', async () => {
    const hookResult = runHookWithJotaiProvider(useAnyEditorDataIsDirty, store);

    expect(hookResult.current).toBeFalsy();

    store.set(initialEditorsContent.get(editorId1)!.updateEditorContentBufferAtom, {
      type: 'refstudio',
      jsonContent: { doc: 'Updated content' },
    });

    await waitFor(() => {
      const value = hookResult.current;
      expect(value).toBeTruthy();
    });
  });
});
