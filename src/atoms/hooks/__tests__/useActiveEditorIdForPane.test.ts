import { createStore } from 'jotai';

import { act } from '../../../test/test-utils';
import { paneGroupAtom, updatePaneGroup } from '../../core/paneGroup';
import { buildEditorId } from '../../types/EditorData';
import { PaneId } from '../../types/PaneGroup';
import { useActiveEditorIdForPane } from '../useActiveEditorIdForPane';
import { runHookWithRendersCount } from './test-utils';

describe('useActiveEditorIdForPane', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('text', 'editor1');
  const editorId2 = buildEditorId('text', 'editor2');
  const initialState = {
    LEFT: {
      openEditorIds: [],
      activeEditorId: editorId1,
    },
    RIGHT: {
      openEditorIds: [],
      activeEditorId: editorId2,
    },
  };

  beforeEach(() => {
    store = createStore();
    store.set(paneGroupAtom, initialState);
  });

  it.each<PaneId>(['LEFT', 'RIGHT'])('should return the id of the active editor in the %s pane', (paneId) => {
    const { hookResult } = runHookWithRendersCount(() => useActiveEditorIdForPane(paneId), store).current;
    expect(hookResult).toBe(initialState[paneId].activeEditorId);
  });

  it('should rerender if the active editor in left pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorIdForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'LEFT', activeEditorId: editorId2 });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(editorId2);
  });

  it('should not rerender if the active editor in LEFT pane is not updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorIdForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'RIGHT', activeEditorId: editorId1 });
    });

    expect(utils.current.rendersCount).toBe(1);
  });
});
