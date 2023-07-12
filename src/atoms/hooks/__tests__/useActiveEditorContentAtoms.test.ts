import { createStore } from 'jotai';
import { act } from 'react-dom/test-utils';

import { activePaneIdAtom } from '../../core/activePane';
import { createEditorContentAtoms } from '../../core/createEditorContentAtoms';
import { editorsContentStateAtom } from '../../core/editorContent';
import { paneGroupAtom, updatePaneGroup } from '../../core/paneGroup';
import { EditorContentAtoms } from '../../types/EditorContentAtoms';
import { buildEditorId, EditorId } from '../../types/EditorData';
import { PaneGroupState } from '../../types/PaneGroup';
import { useActiveEditorContentAtoms } from '../useActiveEditorContentAtoms';
import { runHookWithRendersCount } from './test-utils';

describe('useActiveEditorContentAtoms', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('text', 'editor1');
  const editorId2 = buildEditorId('text', 'editor2');
  const initialPaneState: PaneGroupState = {
    LEFT: {
      openEditorIds: [],
      activeEditorId: editorId1,
    },
    RIGHT: {
      openEditorIds: [],
      activeEditorId: editorId2,
    },
  };
  const initialEditorsContent = new Map<EditorId, EditorContentAtoms>([
    [editorId1, createEditorContentAtoms(editorId1, { type: 'text', textContent: '' })],
    [editorId2, createEditorContentAtoms(editorId2, { type: 'text', textContent: '' })],
  ]);

  beforeEach(() => {
    store = createStore();
    store.set(activePaneIdAtom, 'LEFT');
    store.set(paneGroupAtom, initialPaneState);
    store.set(editorsContentStateAtom, initialEditorsContent);
  });

  it('should return the active editor if of the active pane', () => {
    const { hookResult } = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store).current;

    expect(hookResult).toBe(initialEditorsContent.get(editorId1));
  });

  it('should return null when the LEFT pane has no active editor', () => {
    store.set(updatePaneGroup, { paneId: 'LEFT', activeEditorId: undefined });

    const { hookResult } = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store).current;

    expect(hookResult).toBeNull();
  });

  it('should rerender if the active pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(activePaneIdAtom, 'RIGHT');
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(initialEditorsContent.get(editorId2));
  });

  it('should rerender when LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toBe(initialEditorsContent.get(editorId1));

    act(() => {
      store.set(updatePaneGroup, { paneId: 'LEFT', activeEditorId: editorId2 });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toStrictEqual(initialEditorsContent.get(editorId2));
  });

  it('should not rerender when RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'RIGHT', activeEditorId: editorId1 });
    });

    expect(utils.current.rendersCount).toBe(1);
  });

  it('should rerender when editor content from LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toBe(initialEditorsContent.get(editorId1));

    const updatedState = new Map(store.get(editorsContentStateAtom));
    updatedState.set(editorId1, createEditorContentAtoms(editorId1, { type: 'text', textContent: 'Updated content' }));
    act(() => {
      store.set(editorsContentStateAtom, updatedState);
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(updatedState.get(editorId1));
  });

  it('should not rerender when editor content from RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtoms(), store);

    expect(utils.current.rendersCount).toBe(1);

    const updatedState = new Map(store.get(editorsContentStateAtom));
    updatedState.set(editorId2, createEditorContentAtoms(editorId2, { type: 'text', textContent: 'Updated content' }));
    act(() => {
      store.set(editorsContentStateAtom, updatedState);
    });

    expect(utils.current.rendersCount).toBe(1);
  });
});
