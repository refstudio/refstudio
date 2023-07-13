import { createStore } from 'jotai';
import { MenuProvider } from 'kmenu';

import { runHookWithJotaiProvider } from '../../atoms/__tests__/test-utils';
import { useOpenEditorsCountForPane } from '../../atoms/hooks/useOpenEditorsCountForPane';
import { setReferencesAtom } from '../../atoms/referencesState';
import { emitEvent, RefStudioEventName } from '../../events';
import { REFERENCES } from '../../features/references/__tests__/test-fixtures';
import { screen, setupWithJotaiProvider } from '../../test/test-utils';
import { CommandPalette } from '../CommandPalette';

vi.mock('../../events');

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
        <CommandPalette index={1} />
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

  it('should display second menu', () => {
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={2} />
      </MenuProvider>,
      store,
    );

    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[1].title)).toBeInTheDocument();
  });

  it('should open reference on click', async () => {
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette index={2} />
      </MenuProvider>,
      store,
    );

    await user.click(screen.getByText(REFERENCES[0].title));
    const { current } = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('RIGHT'), store);

    expect(current).toBe(1);
  });
});
