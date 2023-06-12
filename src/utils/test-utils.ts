import { render } from '@testing-library/react';

function customRender(ui: React.ReactElement, options = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return render(ui, {
    // wrap provider(s) here if needed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    wrapper: ({ children }) => children,
    ...options,
  });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
// override render export
export { customRender as render };

export async function pendingAsyncSideEffects(ms = 1) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
