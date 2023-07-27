import { createStore } from 'jotai';

import { act } from '../../../test/test-utils';
import { activePaneIdAtom } from '../../core/activePane';
import { paneGroupAtom, updatePaneGroup } from '../../core/paneGroup';
import { buildEditorId } from '../../types/EditorData';
import { useActiveEditorId } from '../useActiveEditorId';
import { runHookWithRendersCount } from './test-utils';

describe('useActiveEditorId', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('refstudio', 'editor1');
  const editorId2 = buildEditorId('refstudio', 'editor2');

  beforeEach(() => {
    store = createStore();
    store.set(paneGroupAtom, {
      LEFT: {
        openEditorIds: [],
        activeEditorId: editorId1,
      },
      RIGHT: {
        openEditorIds: [],
        activeEditorId: editorId2,
      },
    });
    store.set(activePaneIdAtom, 'LEFT');
  });

  it('should return the id of the active editor in the active pane', () => {
    const { hookResult } = runHookWithRendersCount(() => useActiveEditorId(), store).current;
    expect(hookResult).toBe(editorId1);
  });

  it('should rerender if the active pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorId(), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(activePaneIdAtom, 'RIGHT');
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(editorId2);
  });

  it('should rerender if the active editor in LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorId(), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'LEFT', activeEditorId: editorId2 });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toBe(editorId2);
  });

  it('should not rerender if the active editor in RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useActiveEditorId(), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'RIGHT', activeEditorId: editorId1 });
    });

    expect(utils.current.rendersCount).toBe(1);
  });
});
