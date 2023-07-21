import { createStore } from 'jotai';
import { MenuProvider } from 'kmenu';

import { runHookWithJotaiProvider } from '../../../atoms/__tests__/test-utils';
import { useOpenEditorsCountForPane } from '../../../atoms/hooks/useOpenEditorsCountForPane';
import { setReferencesAtom } from '../../../atoms/referencesState';
import { selectionAtom } from '../../../atoms/selectionState';
import { emitEvent, RefStudioEventName } from '../../../events';
import { RewriteWidget } from '../../../features/components/RewriteWidget';
import { REFERENCES } from '../../../features/references/__tests__/test-fixtures';
import { screen, setupWithJotaiProvider } from '../../../test/test-utils';
import { CommandPalette } from '../CommandPalette';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES, INDEX_REWRITE_WIDGET } from '../CommandPaletteConfigs';

vi.mock('../../../events');
vi.mock('../../../features/components/RewriteWidget');

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

describe('CommandPalette', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    store.set(setReferencesAtom, REFERENCES);

    vi.mock('../../../features/components/RewriteWidget', () => {
      const Fake = vi.fn(() => null);
      return { RewriteWidget: Fake };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display hidden', () => {
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette />
      </MenuProvider>,
      store,
    );

    expect(screen.getByTestId(CommandPalette.name)).toBeInTheDocument();
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

  it.each<{ text: string; event: RefStudioEventName }>([
    { text: 'New File', event: 'refstudio://menu/file/new' },
    { text: 'Close Active Editor', event: 'refstudio://menu/file/close' },
    { text: 'Show References', event: 'refstudio://menu/references/open' },
    { text: 'Upload References', event: 'refstudio://menu/references/upload' },
  ])('should emit menu event to create new file', async ({ text, event }) => {
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={1} />
      </MenuProvider>,
      store,
    );

    await user.click(screen.getByText(text));

    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(event);
  });

  it.each<{ text: string; index: number }>([
    { text: 'Rewrite selection...', index: INDEX_REWRITE_WIDGET },
    { text: 'Open File...', index: INDEX_FILES },
    { text: 'Find References...', index: INDEX_REFERENCES },
  ])('Should open menu $index on $text', async ({ text, index }) => {
    const onOpen = vi.fn();
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_MAIN} onOpen={onOpen} />
      </MenuProvider>,
      store,
    );

    await user.click(screen.getByText(text));
    expect(onOpen).toHaveBeenLastCalledWith(index);
  });

  it('should display second menu', () => {
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_REFERENCES} />
      </MenuProvider>,
      store,
    );

    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[1].title)).toBeInTheDocument();
  });

  it('should open files menu on CMD+P', async () => {
    const onOpen = vi.fn();
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_MAIN} onOpen={onOpen} />
      </MenuProvider>,
      store,
    );

    await user.keyboard('{Meta>}[KeyP]');
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select file to open...')).toBeInTheDocument();
    expect(onOpen).toHaveBeenLastCalledWith(INDEX_FILES);
  });

  it.each<{ char: string; index: number }>([
    { char: '>', index: INDEX_FILES },
    { char: '@', index: INDEX_REFERENCES },
  ])('should open $index menu on $char', async ({ char, index }) => {
    const onOpen = vi.fn();
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_MAIN} onOpen={onOpen} />
      </MenuProvider>,
      store,
    );

    await user.type(screen.getByPlaceholderText('Search commands'), char);
    expect(onOpen).toHaveBeenLastCalledWith(index);
  });

  it('should open reference on click', async () => {
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_REFERENCES} />
      </MenuProvider>,
      store,
    );

    await user.click(screen.getByText(REFERENCES[0].title));
    const { current } = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('RIGHT'), store);

    expect(current).toBe(1);
  });

  it('should open rewrite widget empty without selection', () => {
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_REWRITE_WIDGET} />
      </MenuProvider>,
      store,
    );

    expect(screen.getByText('select some text')).toBeInTheDocument();
  });

  it('should open rewrite widget without selection', () => {
    store.set(selectionAtom, 'Some text selected');
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={INDEX_REWRITE_WIDGET} />
      </MenuProvider>,
      store,
    );

    expect(screen.queryByText('select some text')).not.toBeInTheDocument();
    expect(RewriteWidget).toHaveBeenCalled();
    expect(vi.mocked(RewriteWidget).mock.lastCall![0]).toMatchObject({ selection: 'Some text selected' });
  });
});
