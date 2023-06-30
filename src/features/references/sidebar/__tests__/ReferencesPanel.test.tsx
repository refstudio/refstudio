import { runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { emitEvent, RefStudioEvents } from '../../../../events';
import { act, screen, setupWithJotaiProvider } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesPanel } from '../ReferencesPanel';

vi.mock('../../../../events');

describe('ReferencesPanel', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display welcome message with empty references', () => {
    setupWithJotaiProvider(<ReferencesPanel />);
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText(/welcome to your refstudio references library/i)).toBeInTheDocument();
  });

  it.each([
    { title: 'Add References', event: RefStudioEvents.menu.references.upload },
    { title: 'Open References', event: RefStudioEvents.menu.references.open },
    { title: 'Export References (NOT IMPLEMENTED)', event: RefStudioEvents.menu.references.export },
  ])('should trigger $title on click', async ({ title, event }) => {
    const { user } = setupWithJotaiProvider(<ReferencesPanel />);
    await user.click(screen.getByTitle(title));
    expect(vi.mocked(emitEvent)).toBeCalledWith(event);
  });

  it('should display ReferencesList with references', () => {
    const { store } = setupWithJotaiProvider(<ReferencesPanel />);
    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => setReferences.current(REFERENCES));

    expect(screen.queryByText(/welcome to your refstudio references library/i)).not.toBeInTheDocument();
  });
});
