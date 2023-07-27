import { createStore } from 'jotai';

import { act } from '../../../test/test-utils';
import { editorsDataAtom, setEditorDataIsDirtyAtom } from '../../core/editorData';
import { paneGroupAtom, updatePaneGroup } from '../../core/paneGroup';
import { buildEditorId } from '../../types/EditorData';
import { PaneId } from '../../types/PaneGroup';
import { useOpenEditorsDataForPane } from '../useOpenEditorsDataForPane';
import { runHookWithRendersCount } from './test-utils';

describe('useOpenEditorsDataForPane', () => {
  let store: ReturnType<typeof createStore>;
  const editorId1 = buildEditorId('refstudio', 'editor1');
  const editorId2 = buildEditorId('refstudio', 'editor2');
  const initialPaneState = {
    LEFT: {
      openEditorIds: [editorId1, editorId2],
    },
    RIGHT: {
      openEditorIds: [editorId2],
    },
  };
  const initialEditorsData = new Map([
    [editorId1, { title: 'editor1', id: editorId1 }],
    [editorId2, { title: 'editor2', id: editorId2 }],
  ]);

  beforeEach(() => {
    store = createStore();
    store.set(paneGroupAtom, initialPaneState);
    store.set(editorsDataAtom, initialEditorsData);
  });

  it.each<PaneId>(['LEFT', 'RIGHT'])('should return the editors data for open editors in the %s pane', (paneId) => {
    const { hookResult } = runHookWithRendersCount(() => useOpenEditorsDataForPane(paneId), store).current;
    expect(hookResult).toStrictEqual(
      initialPaneState[paneId].openEditorIds.map((editorId) => initialEditorsData.get(editorId)),
    );
  });

  it('should rerender when LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsDataForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toStrictEqual(
      initialPaneState.LEFT.openEditorIds.map((editorId) => initialEditorsData.get(editorId)),
    );

    act(() => {
      store.set(updatePaneGroup, { paneId: 'LEFT', openEditorIds: [editorId1] });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toStrictEqual([initialEditorsData.get(editorId1)]);
  });

  it('should not rerender when RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsDataForPane('LEFT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(updatePaneGroup, { paneId: 'RIGHT', openEditorIds: [editorId1] });
    });

    expect(utils.current.rendersCount).toBe(1);
  });

  it('should rerender when editor data from RIGHT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsDataForPane('RIGHT'), store);

    expect(utils.current.rendersCount).toBe(1);
    expect(utils.current.hookResult).toStrictEqual(
      initialPaneState.RIGHT.openEditorIds.map((editorId) => initialEditorsData.get(editorId)),
    );

    act(() => {
      store.set(setEditorDataIsDirtyAtom, { editorId: editorId2, isDirty: true });
    });

    expect(utils.current.rendersCount).toBe(2);
    expect(utils.current.hookResult).toStrictEqual([{ ...initialEditorsData.get(editorId2), isDirty: true }]);
  });

  it('should not rerender when editor data from LEFT pane is updated', () => {
    const utils = runHookWithRendersCount(() => useOpenEditorsDataForPane('RIGHT'), store);

    expect(utils.current.rendersCount).toBe(1);

    act(() => {
      store.set(setEditorDataIsDirtyAtom, { editorId: editorId1, isDirty: true });
    });

    expect(utils.current.rendersCount).toBe(1);
  });
});
