import { getReferencesAtom, setReferencesAtom } from '../../../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/test-utils';
import { act, screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { REFERENCES } from '../../test-fixtures';
import { ResetReferencesInstructions } from '../ResetReferencesInstructions';

vi.mock('../../../events');

describe('ResetReferencesInstructions', () => {
  it('should reset references when click in reset', async () => {
    const { user, store } = setupWithJotaiProvider(<ResetReferencesInstructions />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const getReferences = runGetAtomHook(getReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));
    expect(getReferences.current).toStrictEqual(REFERENCES);

    await user.click(screen.getByText(/reset references store/));

    expect(getReferences.current).toStrictEqual([]);
  });
});
