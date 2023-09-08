import { atom, createStore } from 'jotai';
import { MenuProvider } from 'kmenu';

import { paneGroupAtom } from '../../../atoms/core/paneGroup';
import { focusPaneAtom } from '../../../atoms/paneActions';
import { isProjectOpenAtom } from '../../../atoms/projectState';
import { buildEditorId, EditorId } from '../../../atoms/types/EditorData';
import { PaneGroupState, PaneId } from '../../../atoms/types/PaneGroup';
import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../../../events';
import { screen, setupWithJotaiProvider } from '../../../test/test-utils';
import { CommandPalette } from '../CommandPalette';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES } from '../CommandPaletteConfigs';

interface Context {
  activeEditorId: EditorId;
  activePaneId: PaneId;
  isEditorOpen: boolean;
  isProjectOpen: boolean;
  paneGroup: PaneGroupState;
}

let context = vi.hoisted(() => ({} as Context));

const DEFAULT_CONTEXT: Context = {
  activeEditorId: buildEditorId('refstudio', 'test.refstudio'),
  activePaneId: 'LEFT',
  isEditorOpen: false,
  isProjectOpen: true,
  paneGroup: { LEFT: { openEditorIds: [] }, RIGHT: { openEditorIds: [] } },
};

vi.mock('../../../events');
vi.mock('../../../atoms/projectState', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  return {
    ...mod,
    isProjectOpenAtom: atom(() => context.isProjectOpen),
  };
});

vi.mock('../../../atoms/core/paneGroup', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  return {
    ...mod,
    paneGroupAtom: atom(() => context.paneGroup),
  };
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

type Event = {
  [K in RefStudioEventName]: RefStudioEventPayload<K> extends undefined
  ? {
    name: K;
    payload?: undefined;
  }
  : {
    name: K;
    payload: RefStudioEventPayload<K> | ((context: Context) => RefStudioEventPayload<K>);
  };
}[RefStudioEventName];

interface BaseAction {
  type: string;
}

interface EventAction extends BaseAction {
  type: 'event';
  event: Event;
}

interface MenuAction extends BaseAction {
  type: 'menu';
  index: number;
}

type Action = EventAction | MenuAction;

interface TestCase {
  name: string;
  contextOverrides?: Partial<Context>;
  actions: string[];
}

const ACTIONS: Record<string, Action> = {
  // AI
  'Complete phrase for me...': { type: 'event', event: { name: 'refstudio://ai/suggestion/suggest' } },
  'Rewrite selection...': {
    type: 'event',
    event: { name: 'refstudio://sidebars/open', payload: { panel: 'Rewriter' } },
  },
  'Talk with references...': {
    type: 'event',
    event: { name: 'refstudio://sidebars/open', payload: { panel: 'Chatbot' } },
  },
  // Files
  'New File': { type: 'event', event: { name: 'refstudio://menu/file/new' } },
  Save: { type: 'event', event: { name: 'refstudio://menu/file/save' } },
  'Save File as Markdown': { type: 'event', event: { name: 'refstudio://menu/file/markdown' } },
  // Projects
  'New project...': { type: 'event', event: { name: 'refstudio://menu/file/project/new' } },
  'Open project...': { type: 'event', event: { name: 'refstudio://menu/file/project/open' } },
  'Close current project': { type: 'event', event: { name: 'refstudio://menu/file/project/close' } },
  'Open sample project...': { type: 'event', event: { name: 'refstudio://menu/file/project/new/sample' } },
  // References
  'Find References...': { type: 'menu', index: INDEX_REFERENCES },
  'Show References': { type: 'event', event: { name: 'refstudio://menu/references/open' } },
  'Upload References': { type: 'event', event: { name: 'refstudio://menu/references/upload' } },
  // Editors
  'Move Left': {
    type: 'event',
    event: {
      name: 'refstudio://editors/move',
      payload: ({ activeEditorId }: Context) => ({
        fromPaneEditorId: { editorId: activeEditorId, paneId: 'RIGHT' },
        toPaneId: 'LEFT',
      }),
    },
  },
  'Move Right': {
    type: 'event',
    event: {
      name: 'refstudio://editors/move',
      payload: ({ activeEditorId }) => ({
        fromPaneEditorId: { editorId: activeEditorId, paneId: 'LEFT' },
        toPaneId: 'RIGHT',
      }),
    },
  },
  'Close Editor': { type: 'event', event: { name: 'refstudio://menu/file/close' } },
  'Close All Editors': { type: 'event', event: { name: 'refstudio://menu/file/close/all' } },
  'Quick Files...': { type: 'menu', index: INDEX_FILES },
};

describe('CommandPalette', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    context = { ...DEFAULT_CONTEXT };
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be hidden', () => {
    expect(isProjectOpenAtom).toBeDefined();
    expect(paneGroupAtom).toBeDefined();
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette />
      </MenuProvider>,
      store,
    );

    expect(screen.getByTestId(CommandPalette.name)).toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('should display first menu', () => {
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_MAIN} />
      </MenuProvider>,
      store,
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  describe.each<TestCase>([
    {
      name: 'No project open',
      contextOverrides: {
        isProjectOpen: false,
      },
      actions: ['New project...', 'Open project...', 'Open sample project...'],
    },
    {
      name: 'No editor open',
      actions: [
        'Talk with references...',
        'Find References...',
        'Show References',
        'Upload References',
        'New File',
        'New project...',
        'Open project...',
        'Close current project',
        'Open sample project...',
        'Quick Files...',
      ],
    },
    {
      name: 'Non-RefStudio editor open on the left',
      contextOverrides: {
        activeEditorId: buildEditorId('pdf', 'test.pdf'),
        isEditorOpen: true,
      },
      actions: [
        'Talk with references...',
        'Find References...',
        'Show References',
        'Upload References',
        'New File',
        'New project...',
        'Open project...',
        'Close current project',
        'Open sample project...',
        'Move Right',
        'Close Editor',
        'Close All Editors',
        'Quick Files...',
      ],
    },
    {
      name: 'Non-RefStudio editor open on the right',
      contextOverrides: {
        activeEditorId: buildEditorId('pdf', 'test.pdf'),
        activePaneId: 'RIGHT',
        isEditorOpen: true,
      },
      actions: [
        'Talk with references...',
        'Find References...',
        'Show References',
        'Upload References',
        'New File',
        'New project...',
        'Open project...',
        'Close current project',
        'Open sample project...',
        'Move Left',
        'Close Editor',
        'Close All Editors',
        'Quick Files...',
      ],
    },
    {
      name: 'RefStudio editor open on the left',
      contextOverrides: {
        activeEditorId: buildEditorId('refstudio', 'test.refstudio'),
        isEditorOpen: true,
      },
      actions: [
        'Complete phrase for me...',
        'Rewrite selection...',
        'Talk with references...',
        'Find References...',
        'Show References',
        'Upload References',
        'New File',
        'Save',
        'Save File as Markdown',
        'New project...',
        'Open project...',
        'Close current project',
        'Open sample project...',
        'Move Right',
        'Close Editor',
        'Close All Editors',
        'Quick Files...',
      ],
    },
    {
      name: 'RefStudio editor open on the right',
      contextOverrides: {
        activeEditorId: buildEditorId('refstudio', 'test.refstudio'),
        activePaneId: 'RIGHT',
        isEditorOpen: true,
      },
      actions: [
        'Complete phrase for me...',
        'Rewrite selection...',
        'Talk with references...',
        'Find References...',
        'Show References',
        'Upload References',
        'New File',
        'Save',
        'Save File as Markdown',
        'New project...',
        'Open project...',
        'Close current project',
        'Open sample project...',
        'Move Left',
        'Close Editor',
        'Close All Editors',
        'Quick Files...',
      ],
    },
  ])('$name', ({ actions, contextOverrides }) => {
    beforeEach(() => {
      const testContext = { ...DEFAULT_CONTEXT, ...(contextOverrides ?? {}) };
      store.set(focusPaneAtom, testContext.activePaneId);

      if (testContext.isEditorOpen) {
        testContext.paneGroup[testContext.activePaneId] = {
          openEditorIds: [testContext.activeEditorId],
          activeEditorId: testContext.activeEditorId,
        };
      }

      context = testContext;
    });

    it('should display correct options', () => {
      setupWithJotaiProvider(
        <MenuProvider config={{ animationDuration: 0 }}>
          <CommandPalette index={INDEX_MAIN} />
        </MenuProvider>,
        store,
      );

      expect(screen.getAllByRole('option')).toHaveLength(actions.length);
      actions.forEach((action) => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });

    it.each<string>(actions)('should correctly trigger action for %s', async (action) => {
      const onOpen = vi.fn();

      const { user } = setupWithJotaiProvider(
        <MenuProvider config={{ animationDuration: 0 }}>
          <CommandPalette index={INDEX_MAIN} onOpen={onOpen} />
        </MenuProvider>,
        store,
      );

      await user.click(screen.getByText(action));

      const actionData = ACTIONS[action];

      if ('event' in actionData) {
        const args = actionData.event.payload;
        const expectedPayload = typeof args === 'function' ? args(context) : args;
        const expectedPayloads = [actionData.event.name, ...(expectedPayload === undefined ? [] : [expectedPayload])];
        expect(emitEvent).toHaveBeenCalledTimes(1);
        expect(emitEvent).toHaveBeenCalledWith(...expectedPayloads);
      } else {
        expect(onOpen).toHaveBeenLastCalledWith(actionData.index);
      }
    });
  });
});
