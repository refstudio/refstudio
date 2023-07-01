import { referencesSyncInProgressAtom } from '../../../../atoms/referencesState';
import { runSetAtomHook } from '../../../../atoms/test-utils';
import { emitEvent } from '../../../../events';
import { act, screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { UploadTipInstructions } from '../UploadTipInstructions';

vi.mock('../../../../events');

describe('UploadTipInstructions', () => {
  it('should display tip instructions', () => {
    setupWithJotaiProvider(<UploadTipInstructions />);
    expect(screen.getByText(/TIP/i)).toBeInTheDocument();
    expect(screen.getByText(/or drag.drop PDF files for upload/i)).toBeInTheDocument();
  });

  it('should hide tip instructions during sync', () => {
    const { store } = setupWithJotaiProvider(<UploadTipInstructions />);

    const setSync = runSetAtomHook(referencesSyncInProgressAtom, store);
    act(() => setSync.current(true));

    expect(screen.queryByText(/TIP/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/or drag.drop PDF files for upload/i)).not.toBeInTheDocument();
  });

  it('should trigger upload event when click in CLICK HERE link', async () => {
    const { user } = setupWithJotaiProvider(<UploadTipInstructions />);
    await user.click(screen.getByText(/here/));

    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith('refstudio://menu/references/upload');
  });
});
