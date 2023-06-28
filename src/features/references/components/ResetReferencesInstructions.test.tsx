import { getReferencesAtom, setReferencesAtom } from '../../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../../atoms/test-utils';
import { act, screen, setupWithJotaiProvider } from '../../../test/test-utils';
import { ResetReferencesInstructions } from './ResetReferencesInstructions';

vi.mock('../../../events');

describe('ResetReferencesInstructions', () => {
  it('should reset references when click in reset', async () => {
    const { user, store } = setupWithJotaiProvider(<ResetReferencesInstructions />);

    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const getReferences = runGetAtomHook(getReferencesAtom, store);

    const SAMPLE_REFERENCE = {
      id: 'ref.id',
      citationKey: 'citationKey',
      title: 'Reference document title',
      abstract: '',
      authors: [],
      filename: 'title.pdf',
      publishedDate: '2023-06-22',
    };

    act(() => {
      setReferences.current([SAMPLE_REFERENCE]);
    });

    expect(getReferences.current).toStrictEqual([SAMPLE_REFERENCE]);

    await user.click(screen.getByText(/reset references store/));

    expect(getReferences.current).toStrictEqual([]);
  });
});
