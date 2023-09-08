import { createStore } from 'jotai';
import { MenuProvider } from 'kmenu';

import { makeFile } from '../../../atoms/__tests__/test-fixtures';
import { activePaneIdAtom } from '../../../atoms/core/activePane';
import { moveEditorToPaneAtom, openReferencesAtom } from '../../../atoms/editorActions';
import { openFileEntryAtom } from '../../../atoms/fileEntryActions';
import { closeProjectAtom, currentProjectIdAtom } from '../../../atoms/projectState';
import { setReferencesAtom } from '../../../atoms/referencesState';
import { buildEditorId, EditorId } from '../../../atoms/types/EditorData';
import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../../../events';
import { REFERENCES } from '../../../features/references/__tests__/test-fixtures';
import { screen, setupWithJotaiProvider } from '../../../test/test-utils';
import { CommandPalette } from '../CommandPalette';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES } from '../CommandPaletteConfigs';

vi.mock('../../../events');
vi.mock('../../../io/filesystem');

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
        payload: RefStudioEventPayload<K> | ((context: { editorId: EditorId }) => RefStudioEventPayload<K>);
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
  beforeEach?: () => void | Promise<void>;
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
      payload: ({ editorId }: { editorId: EditorId }) => ({
        fromPaneEditorId: { editorId, paneId: 'RIGHT' },
        toPaneId: 'LEFT',
      }),
    },
  },
  'Move Right': {
    type: 'event',
    event: {
      name: 'refstudio://editors/move',
      payload: ({ editorId }: { editorId: EditorId }) => ({
        fromPaneEditorId: { editorId, paneId: 'LEFT' },
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
  let editorId: EditorId;

  beforeEach(() => {
    store = createStore();
    store.set(setReferencesAtom, REFERENCES);
    store.set(currentProjectIdAtom, 'project-id');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be hidden', () => {
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
      beforeEach: async () => {
        await store.set(closeProjectAtom);
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
      beforeEach: () => {
        store.set(openReferencesAtom);
        editorId = buildEditorId('references');
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
      beforeEach: () => {
        store.set(openFileEntryAtom, makeFile('test.pdf'));
        editorId = buildEditorId('pdf', 'test.pdf');
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
      beforeEach: () => {
        store.set(openFileEntryAtom, makeFile('test.refstudio'));
        editorId = buildEditorId('refstudio', 'test.refstudio');
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
      beforeEach: () => {
        store.set(openFileEntryAtom, makeFile('test.refstudio'));
        editorId = buildEditorId('refstudio', 'test.refstudio');
        store.set(moveEditorToPaneAtom, { editorId, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
        console.log(store.get(activePaneIdAtom));
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
  ])('$name', (testCase) => {
    if (testCase.beforeEach) {
      beforeEach(testCase.beforeEach);
    }

    it('should display correct options', () => {
      setupWithJotaiProvider(
        <MenuProvider config={{ animationDuration: 0 }}>
          <CommandPalette index={INDEX_MAIN} />
        </MenuProvider>,
        store,
      );

      expect(screen.getAllByRole('option')).toHaveLength(testCase.actions.length);
      testCase.actions.forEach((action) => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });

    it.each<string>(testCase.actions)('should correctly trigger action for %s', async (action) => {
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
        const expectedPayload = typeof args === 'function' ? args({ editorId }) : args;
        const expectedPayloads = [actionData.event.name, ...(expectedPayload === undefined ? [] : [expectedPayload])];
        expect(emitEvent).toHaveBeenCalledTimes(1);
        expect(emitEvent).toHaveBeenCalledWith(...expectedPayloads);
      } else {
        expect(onOpen).toHaveBeenLastCalledWith(actionData.index);
      }
    });
  });
});
