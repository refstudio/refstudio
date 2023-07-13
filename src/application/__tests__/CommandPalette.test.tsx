import { createStore } from 'jotai';
import { MenuProvider } from 'kmenu';

import { screen, setupWithJotaiProvider } from '../../test/test-utils';
import { CommandPalette } from '../CommandPalette';

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

describe('CommandPalette', () => {
  it.skip('should display hidden', () => {
    const store = createStore();
    setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette />
      </MenuProvider>,
      store,
    );

    expect(screen.getByTestId(CommandPalette.name)).toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();

    // screen.debug();
  });

  it.skip('should display after CMD+K', async () => {
    const store = createStore();
    const { user } = setupWithJotaiProvider(
      <MenuProvider config={{ animationDuration: 0 }}>
        <CommandPalette />
      </MenuProvider>,
      store,
    );

    await user.keyboard('{meta}K{/meta}');
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
