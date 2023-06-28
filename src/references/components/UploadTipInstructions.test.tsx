import { createStore, Provider } from 'jotai';

import { referencesSyncInProgressAtom } from '../../atoms/referencesState';
import { runSetAtomHook } from '../../atoms/test-utils';
import { emitEvent, RefStudioEvents } from '../../events';
import { act, render, screen, setup } from '../../utils/test-utils';
import { UploadTipInstructions } from './UploadTipInstructions';

vi.mock('../../events');

describe('UploadTipInstructions', () => {
  it('should display tip instructions', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <UploadTipInstructions />
      </Provider>,
    );
    expect(screen.getByText(/TIP/i)).toBeInTheDocument();
    expect(screen.getByText(/or drag.drop PDF files for upload/i)).toBeInTheDocument();
  });

  it('should hide tip instructions during sync', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <UploadTipInstructions />
      </Provider>,
    );

    const setSync = runSetAtomHook(referencesSyncInProgressAtom, store);
    act(() => setSync.current(true));

    expect(screen.queryByText(/TIP/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/or drag.drop PDF files for upload/i)).not.toBeInTheDocument();
  });

  it('should trigger upload event when click in CLICK HERE link', async () => {
    const store = createStore();
    const { user } = setup(
      <Provider store={store}>
        <UploadTipInstructions />
      </Provider>,
    );

    await user.click(screen.getByText(/here/));

    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(RefStudioEvents.menu.references.upload);
  });
});
