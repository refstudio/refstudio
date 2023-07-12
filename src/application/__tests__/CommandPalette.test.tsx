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
  it('should display hidden', () => {
    const store = createStore();
    setupWithJotaiProvider(
      <MenuProvider>
        <CommandPalette />
      </MenuProvider>,
      store,
    );

    expect(screen.getByTestId(CommandPalette.name)).toBeInTheDocument();
    expect(screen.queryByText('Search commands')).not.toBeInTheDocument();
  });
});
