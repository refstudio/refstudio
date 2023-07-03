import { getReferencesAtom, setReferencesAtom } from '../../../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../../../atoms/test-utils';
import { emitEvent } from '../../../../events';
import { noop } from '../../../../lib/noop';
import { act, screen, setupWithJotaiProvider, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../test-fixtures';
import { ReferencesList } from '../ReferencesList';
import { ReferencesPanel } from '../ReferencesPanel';

vi.mock('../../../../events');

describe('ReferencesPanel', () => {
  it('should display welcome message with empty references', () => {
    setupWithJotaiProvider(<ReferencesPanel onRefClicked={noop} />);
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText(/welcome to your refstudio references library/i)).toBeInTheDocument();
  });

  it('should display references list with non-empty references', () => {
    const { store } = setupWithJotaiProvider(<ReferencesPanel onRefClicked={noop} />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));

    expect(screen.queryByText(/welcome to your refstudio references library/i)).not.toBeInTheDocument();
    const referencesListElement = screen.getByTestId(ReferencesList.name);
    expect(referencesListElement).toBeInTheDocument();
    expect(within(referencesListElement).getAllByRole('listitem')).toHaveLength(REFERENCES.length);
  });

  it.each([
    { title: 'Add References', event: 'refstudio://menu/references/upload' },
    { title: 'Open References', event: 'refstudio://menu/references/open' },
  ])('should trigger $title on click', async ({ title, event }) => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel onRefClicked={noop} />);
    await user.click(screen.getByTitle(title));
    expect(vi.mocked(emitEvent)).toBeCalledWith(event);
  });

  it('should reset references when click in reset', async () => {
    const { user, store } = setupWithJotaiProvider(<ReferencesPanel onRefClicked={noop} />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const getReferences = runGetAtomHook(getReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));

    expect(getReferences.current).toStrictEqual(REFERENCES);
    await user.click(screen.getByText(/reset references store/));
    expect(getReferences.current).toStrictEqual([]);
  });
});
