import { useContextMenu } from 'react-contexify';

import { buildEditorId } from '../../atoms/types/EditorData';
import { emitEvent, RefStudioEventName } from '../../events';
import { noop } from '../../lib/noop';
import { render, renderHook, screen, setup } from '../../test/test-utils';
import { ContextMenus } from '../../wrappers/ContextMenus';
import { TabPane } from '../TabPane';
import { TABPANE_TAB_MENU_ID, TabPaneTabContextMenuProps } from '../TabPaneTabContextMenu';

vi.mock('../../events');

const editorsMoveEventName: RefStudioEventName = 'refstudio://editors/move';
const editorsCloseEventName: RefStudioEventName = 'refstudio://editors/close';
const menuFileCloseAllEventName: RefStudioEventName = 'refstudio://menu/file/close/all';

describe('TabPane component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render context menu', () => {
    render(
      <ContextMenus>
        <TabPane
          items={[
            { value: '1', text: 'File 1.txt' },
            { value: '2', text: 'File 2.txt' },
          ]}
          value="1"
          onClick={noop}
          onCloseClick={noop}
        />
      </ContextMenus>,
    );

    const props: TabPaneTabContextMenuProps = { editorId: buildEditorId('references'), paneId: 'LEFT' };
    const { result } = renderHook(() => useContextMenu({ id: TABPANE_TAB_MENU_ID, props }));
    result.current.show({ event: new MouseEvent('contextmenu') });

    expect(screen.getByText('Move Right')).toBeInTheDocument();
  });

  it(`should triger event ${editorsMoveEventName} on click in "Move Left"`, async () => {
    const { user } = setup(
      <ContextMenus>
        <TabPane items={[]} value="1" onClick={noop} onCloseClick={noop} />
      </ContextMenus>,
    );

    const props: TabPaneTabContextMenuProps = { editorId: buildEditorId('references'), paneId: 'RIGHT' };
    const { result } = renderHook(() => useContextMenu({ id: TABPANE_TAB_MENU_ID, props }));
    result.current.show({ event: new MouseEvent('contextmenu') });

    await user.click(screen.getByText('Move Left'));
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(editorsMoveEventName, {
      fromPaneEditorId: { editorId: buildEditorId('references'), paneId: 'RIGHT' },
      toPaneId: 'LEFT',
    });
  });

  it(`should triger event ${editorsMoveEventName} on click in "Move Right"`, async () => {
    const { user } = setup(
      <ContextMenus>
        <TabPane items={[]} value="1" onClick={noop} onCloseClick={noop} />
      </ContextMenus>,
    );

    const props: TabPaneTabContextMenuProps = { editorId: buildEditorId('references'), paneId: 'LEFT' };
    const { result } = renderHook(() => useContextMenu({ id: TABPANE_TAB_MENU_ID, props }));
    result.current.show({ event: new MouseEvent('contextmenu') });

    await user.click(screen.getByText('Move Right'));
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(editorsMoveEventName, {
      fromPaneEditorId: { editorId: buildEditorId('references'), paneId: 'LEFT' },
      toPaneId: 'RIGHT',
    });
  });

  it(`should triger event ${editorsCloseEventName} on click in "Close Editor"`, async () => {
    const { user } = setup(
      <ContextMenus>
        <TabPane items={[]} value="1" onClick={noop} onCloseClick={noop} />
      </ContextMenus>,
    );

    const props: TabPaneTabContextMenuProps = { editorId: buildEditorId('references'), paneId: 'LEFT' };
    const { result } = renderHook(() => useContextMenu({ id: TABPANE_TAB_MENU_ID, props }));
    result.current.show({ event: new MouseEvent('contextmenu') });

    await user.click(screen.getByText('Close Editor'));
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(editorsCloseEventName, {
      editorId: buildEditorId('references'),
      paneId: 'LEFT',
    });
  });

  it(`should triger event ${menuFileCloseAllEventName} on click in "Close All"`, async () => {
    const { user } = setup(
      <ContextMenus>
        <TabPane items={[]} value="1" onClick={noop} onCloseClick={noop} />
      </ContextMenus>,
    );

    const { result } = renderHook(() => useContextMenu({ id: TABPANE_TAB_MENU_ID, props: {} }));
    result.current.show({ event: new MouseEvent('contextmenu') });

    await user.click(screen.getByText('Close All'));
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(menuFileCloseAllEventName);
  });
});

// ########################################################################
// Use the following to debug:
//    - debug: output HTML
//    - logTestingPlaygroundURL: URL for testing playground
// ########################################################################
//
// screen.debug();
// screen.debug(screen.getByText('test'));
// screen.logTestingPlaygroundURL();
//
