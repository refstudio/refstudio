import { render } from '@testing-library/react';
import { default as userEvent } from '@testing-library/user-event';

function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  });
}

export * from '@testing-library/react';
// override render export
export { customRender as render };

export { userEvent };

export function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...customRender(jsx),
  };
}
