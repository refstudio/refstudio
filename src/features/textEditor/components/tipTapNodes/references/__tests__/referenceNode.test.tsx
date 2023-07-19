import { Editor, EditorContent } from '@tiptap/react';
import { createStore } from 'jotai';

import { setReferencesAtom } from '../../../../../../atoms/referencesState';
import { screen, setup, setupWithJotaiProvider } from '../../../../../../test/test-utils';
import { REFERENCES } from '../../../../../references/__tests__/test-fixtures';
import { EDITOR_EXTENSIONS } from '../../../tipTapEditorConfigs';
import { setUpEditorWithSelection } from '../../__tests__/test-utils';
import { ReferencesListPopup } from '../ReferencesListPopup';

global.document.elementFromPoint = vi.fn();

describe('ReferenceNode', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  const referenceId = REFERENCES[0].id;
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    store.set(setReferencesAtom, REFERENCES);
  });

  it('should render the citation key of the reference', () => {
    setUpEditorWithSelection(editor, `<p><span data-type="reference" data-id="${referenceId}"></span>|</p>`);
    setupWithJotaiProvider(<EditorContent editor={editor} />, store);

    expect(screen.getByText(`@${REFERENCES[0].citationKey}`)).toBeInTheDocument();
  });

  it('should render INVALID REFERENCE when the node is missing an id', () => {
    setUpEditorWithSelection(editor, '<p><span data-type="reference"></span>|</p>');
    setup(<EditorContent editor={editor} />);

    expect(screen.getByText(`INVALID REFERENCE`)).toBeInTheDocument();
  });

  it('should open references list', async () => {
    setUpEditorWithSelection(editor, '<p><citation>Citation |</citation></p>');
    const { user } = setupWithJotaiProvider(<EditorContent editor={editor} />, store);

    await user.type(screen.getByText('Citation'), '@');

    const referencePicker = screen.getByTestId(ReferencesListPopup.displayName!);
    expect(referencePicker).toBeInTheDocument();
    expect(referencePicker.getElementsByTagName('button')).toHaveLength(REFERENCES.length);
  });

  it('should close references list', async () => {
    setUpEditorWithSelection(editor, '<p><citation>Citation |</citation></p>');
    const { user } = setupWithJotaiProvider(<EditorContent editor={editor} />, store);

    await user.type(screen.getByText('Citation'), '@');

    const referencePicker = screen.getByTestId(ReferencesListPopup.displayName!);
    expect(referencePicker).toBeInTheDocument();
    expect(referencePicker.getElementsByTagName('button')).toHaveLength(REFERENCES.length);

    await user.keyboard('{Escape}');
    expect(screen.queryByTestId(ReferencesListPopup.displayName!)).not.toBeInTheDocument();
  });

  it('should not open the references list outside of a citation node', async () => {
    window.Range.prototype.getClientRects = vi.fn().mockImplementation(() => []);
    window.Range.prototype.getBoundingClientRect = vi.fn().mockImplementation(() => ({ width: 0 }));

    setUpEditorWithSelection(editor, '<p>Citation |</p>');
    const { user } = setupWithJotaiProvider(<EditorContent editor={editor} />, store);

    await user.type(screen.getByText('Citation'), '@');

    expect(screen.queryByTestId(ReferencesListPopup.displayName!)).not.toBeInTheDocument();
  });
});
