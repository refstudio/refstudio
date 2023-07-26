import { createStore } from 'jotai';
import { act } from 'react-dom/test-utils';

import { createEditorContentAtoms } from '../../core/createEditorContentAtoms';
import { editorsContentStateAtom } from '../../core/editorContent';
import { paneGroupAtom, updatePaneGroup } from '../../core/paneGroup';
import { EditorContentAtoms } from '../../types/EditorContentAtoms';
import { buildEditorId, EditorId } from '../../types/EditorData';
import { PaneGroupState, PaneId } from '../../types/PaneGroup';
import { useActiveEditorContentAtomsForPane } from '../useActiveEditorContentAtomsForPane';
import { runHookWithRendersCount } from './test-utils';

describe('useActiveEditorContentAtomsForPane', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('refstudio', 'editor1');
  const editorId2 = buildEditorId('refstudio', 'editor2');
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
    [editorId1, createEditorContentAtoms(editorId1, { type: 'refstudio', jsonContent: { doc: '' } })],
    [editorId2, createEditorContentAtoms(editorId2, { type: 'refstudio', jsonContent: { doc: '' } })],
  ]);

  beforeEach(() => {
    store = createStore();
    store.set(paneGroupAtom, initialPaneState);
    store.set(editorsContentStateAtom, initialEditorsContent);
  });

  it.each<PaneId>(['LEFT', 'RIGHT'])(
    'should return the editors content atoms for the active editor in the %s pane',
    (paneId) => {
      const { hookResult } = runHookWithRendersCount(() => useActiveEditorContentAtomsForPane(paneId), store).current;
      expect(hookResult).toBe(initialEditorsContent.get(initialPaneState[paneId].activeEditorId!));
    },
  );

  it('should return null when the LEFT pane has no active editor', () => {
    store.set(updatePaneGroup, { paneId: 'LEFT', activeEditorId: undefined });

    const { hookResult } = runHookWithRendersCount(() => useActiveEditorContentAtomsForPane('LEFT'), store).current;

    expect(hookResult).toBeNull();
  });

  it('should rerender when LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtomsForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toBe(initialEditorsContent.get(editorId1));

    act(() => {
      store.set(updatePaneGroup, { paneId: 'LEFT', activeEditorId: editorId2 });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toStrictEqual(initialEditorsContent.get(editorId2));
  });

  it('should not rerender when RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtomsForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'RIGHT', activeEditorId: editorId1 });
    });

    expect(utils.current.rendersCount).toBe(1);
  });

  it('should rerender when editor content from LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtomsForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toBe(initialEditorsContent.get(editorId1));

    const updatedState = new Map(store.get(editorsContentStateAtom));
    updatedState.set(
      editorId1,
      createEditorContentAtoms(editorId1, { type: 'refstudio', jsonContent: { doc: 'Updated content' } }),
    );
    act(() => {
      store.set(editorsContentStateAtom, updatedState);
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(updatedState.get(editorId1));
  });

  it('should not rerender when editor content from RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorContentAtomsForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    const updatedState = new Map(store.get(editorsContentStateAtom));
    updatedState.set(
      editorId2,
      createEditorContentAtoms(editorId2, { type: 'refstudio', jsonContent: { doc: 'Updated content' } }),
    );
    act(() => {
      store.set(editorsContentStateAtom, updatedState);
    });

    expect(utils.current.rendersCount).toBe(1);
  });
});
