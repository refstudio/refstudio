import { createStore } from 'jotai';

import { act } from '../../../test/test-utils';
import { paneGroupAtom, updatePaneGroup } from '../../core/paneGroup';
import { buildEditorId } from '../../types/EditorData';
import { PaneId } from '../../types/PaneGroup';
import { useOpenEditorsCountForPane } from '../useOpenEditorsCountForPane';
import { runHookWithRendersCount } from './test-utils';

describe('useOpenEditorsCountForPane', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('text', 'editor1');
  const editorId2 = buildEditorId('text', 'editor2');
  const editorId3 = buildEditorId('text', 'editor3');
  const initialState = {
    LEFT: {
      openEditorIds: [editorId1, editorId2],
    },
    RIGHT: {
      openEditorIds: [editorId3],
    },
  };

  beforeEach(() => {
    store = createStore();
    store.set(paneGroupAtom, initialState);
  });

  it.each<PaneId>(['LEFT', 'RIGHT'])('should return the number of open editors in the %s pane', (paneId) => {
    const { hookResult } = runHookWithRendersCount(() => useOpenEditorsCountForPane(paneId), store).current;
    expect(hookResult).toBe(initialState[paneId].openEditorIds.length);
  });

  it('should rerender if the LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsCountForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toBe(2);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'LEFT', openEditorIds: [editorId1] });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(1);
  });

  it('should not rerender if the number of open editors in the LEFT pane does not change', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsCountForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      // Close editor2 but opening editor3 at the same time
      store.set(updatePaneGroup, { paneId: 'LEFT', openEditorIds: [editorId1, editorId3] });
    });

    expect(utils.current.rendersCount).toBe(1);
  });

  it('should only render once if the LEFT pane is not updated', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsCountForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'RIGHT', openEditorIds: [] });
    });

    expect(utils.current.rendersCount).toBe(1);
  });
});
