import { createStore, Provider } from 'jotai';

import { getReferencesAtom, setReferencesAtom } from '../../atoms/referencesState';
import { runGetAtomHook, runSetAtomHook } from '../../atoms/test-utils';
import { emitEvent, RefStudioEvents } from '../../events';
import { noop } from '../../utils/noop';
import { act, render, screen, setup } from '../../utils/test-utils';
import { ReferencesPanel } from './ReferencesPanel';

vi.mock('../../events');

describe('ReferencesPanel', () => {
  it('should display welcome message with empty references', () => {
    render(
      <Provider>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText(/welcome to your refstudio references library/i)).toBeInTheDocument();
  });

  it('should display references list with non-empty references', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );

    const setReferences = runSetAtomHook(setReferencesAtom, store);

    act(() => {
      setReferences.current([
        {
          id: 'ref.id',
          citationKey: 'citationKey',
          title: 'Reference document title',
          abstract: '',
          authors: [],
          filename: 'title.pdf',
          publishedDate: '2023-06-22',
        },
      ]);
    });

    expect(screen.queryByText(/welcome to your refstudio references library/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Reference document title/i)).toBeInTheDocument();
  });

  it.each([
    { title: 'Add References', event: RefStudioEvents.menu.references.upload },
    { title: 'Open References', event: RefStudioEvents.menu.references.open },
  ])('should trigger $title on click', async ({ title, event }) => {
    const { user } = setup(<ReferencesPanel onRefClicked={noop} />);
    await user.click(screen.getByTitle(title));
    expect(vi.mocked(emitEvent)).toBeCalledWith(event);
  });

  it('should reset references when click in reset', async () => {
    const store = createStore();
    const { user } = setup(
      <Provider store={store}>
        <ReferencesPanel onRefClicked={noop} />
      </Provider>,
    );

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
