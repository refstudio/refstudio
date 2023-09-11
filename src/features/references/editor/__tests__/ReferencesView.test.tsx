import { createStore } from 'jotai';

import * as referencesAPI from '../../../../api/referencesAPI';
import { runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { act, screen, setupWithJotaiProvider, waitFor } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferenceView } from '../ReferenceView';

vi.mock('../../../../api/referencesAPI', async () => {
  const actual: object = await vi.importActual('../../../../api/referencesAPI');
  return {
    ...actual,
    updateProjectReference: () => null,
  };
});

describe('ReferencesView component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty with invalid reference ID', () => {
    const fakeId = buildEditorId('reference', 'fake');
    const { container } = setupWithJotaiProvider(<ReferenceView referenceId={fakeId} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render selected reference', async () => {
    const [ref1] = REFERENCES;

    const refId = buildEditorId('reference', ref1.id);
    const { store } = setupWithJotaiProvider(<ReferenceView referenceId={refId} />);

    const setReferences = runSetAtomHook(setReferencesAtom, store);
    act(() => setReferences.current(REFERENCES));

    await waitFor(() => {
      expect(screen.getByText(ref1.title)).toBeInTheDocument();
    });
  });

  it('should display editable input for DOI', async () => {
    const store = createStore();
    store.set(setReferencesAtom, REFERENCES);

    const [ref1] = REFERENCES;

    const refId = buildEditorId('reference', ref1.id);
    const { user } = setupWithJotaiProvider(<ReferenceView referenceId={refId} />, store);

    await user.click(screen.getByTitle('Edit Reference'));
    const doiInput = await screen.findByRole('textbox', { name: 'doi' });

    await waitFor(() => {
      expect(doiInput).toBeInTheDocument();
    });
  });

  const updateProjectReferenceSpy = vi.spyOn(referencesAPI, 'updateProjectReference');

  it('should call update API on blur', async () => {
    const store = createStore();
    store.set(setReferencesAtom, REFERENCES);

    const [ref1] = REFERENCES;

    const refId = buildEditorId('reference', ref1.id);
    const { user } = setupWithJotaiProvider(<ReferenceView referenceId={refId} />, store);
    const editButton = screen.getByTitle('Edit Reference');

    await user.click(editButton);
    const doiInput = await screen.findByRole('textbox', { name: 'doi' });
    await user.type(doiInput, '2222');
    await user.tab();

    await waitFor(() => {
      expect(updateProjectReferenceSpy).toHaveBeenCalledTimes(1);
    });
  });
});
