import { runSetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { setReferencesAtom } from '../../../../atoms/referencesState';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { act, screen, setupWithJotaiProvider, waitFor } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferenceView } from '../ReferenceView';

describe('ReferencesView component', () => {
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
});
