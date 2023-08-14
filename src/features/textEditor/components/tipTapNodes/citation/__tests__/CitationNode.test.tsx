import { Editor, EditorContent } from '@tiptap/react';
import { atom } from 'jotai';

import { getDerivedReferenceAtom } from '../../../../../../atoms/referencesState';
import { act, screen, setup } from '../../../../../../test/test-utils';
import { ReferenceItem } from '../../../../../../types/ReferenceItem';
import { EDITOR_EXTENSIONS } from '../../../tipTapEditorConfigs';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../__tests__/test-utils';

vi.mock('../../../../../../atoms/referencesState');

describe('CitationNode', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  const mockedCitationKey = 'shankar2022';

  beforeEach(() => {
    vi.mocked(getDerivedReferenceAtom).mockReturnValue(atom({ citationKey: mockedCitationKey } as ReferenceItem));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render brackets around the citation node', () => {
    setUpEditorWithSelection(editor, '<p><citation>Citation|</citation></p>');
    setup(<EditorContent editor={editor} />);

    const citation = screen.getByTestId('citation');
    expect(citation).toBeInTheDocument();
    expect(citation).toHaveTextContent('[Citation]');
  });

  it('should add "; " decoration after a reference', () => {
    setUpEditorWithSelection(
      editor,
      `<p><citation><span data-type='reference' data-id='TESTID'></span>|</citation></p>`,
    );
    setup(<EditorContent editor={editor} />);

    const citation = screen.getByTestId('citation');
    expect(citation).toBeInTheDocument();
    expect(citation).toHaveTextContent(`[@${mockedCitationKey}; ]`);
  });

  it('should actually add "; " in the document when typing something', () => {
    const [position] = setUpEditorWithSelection(
      editor,
      `<p><citation><span data-type='reference' data-id='TESTID'></span>|</citation></p>`,
    );
    setup(<EditorContent editor={editor} />);

    const citation = screen.getByTestId('citation');
    expect(citation).toBeInTheDocument();

    editor.view.dispatch(editor.state.tr.insertText('a', position));
    expect(citation).toHaveTextContent(new RegExp(`^\\[@${mockedCitationKey}; a\\]$`));
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          <citation>
            <span data-type='reference' data-id='TESTID'>@TESTID</span>
            ; a|
          </citation>
        </p>
      </notionblock>"
    `);
  });

  it('should not add "; " after text', () => {
    const [position] = setUpEditorWithSelection(
      editor,
      `<p><citation><span data-type='reference' data-id='TESTID'>@TESTID</span> and|</citation></p>`,
    );

    setup(<EditorContent editor={editor} />);

    const citation = screen.getByTestId('citation');
    expect(citation).toBeInTheDocument();
    expect(citation).not.toHaveTextContent('; ');

    editor.view.dispatch(editor.state.tr.insertText(' a', position));

    expect(citation).toHaveTextContent(new RegExp(`^\\[@${mockedCitationKey} and a\\]$`));
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          <citation>
            <span data-type='reference' data-id='TESTID'>@TESTID</span>
            and a|
          </citation>
        </p>
      </notionblock>"
    `);
  });

  it('should not add "; " when switching between nodes', async () => {
    const [pos1, pos2] = setUpEditorWithSelection(
      editor,
      `<p><citation><span data-type='reference' data-id='TESTID'>@TESTID</span>|</citation>.</p>
       <p><citation><span data-type='reference' data-id='TESTID'>@TESTID</span>|</citation>.</p>`,
    );

    setup(<EditorContent editor={editor} />);
    editor.commands.setTextSelection(pos1);

    const [citation1, citation2] = screen.getAllByTestId('citation');
    expect(citation1).toBeInTheDocument();
    expect(citation2).toBeInTheDocument();
    expect(citation1).toHaveTextContent('; ');
    expect(citation2).not.toHaveTextContent('; ');

    await act(() => editor.commands.setTextSelection(pos2));
    expect(citation1).toBeInTheDocument();
    expect(citation2).toBeInTheDocument();
    expect(citation1).not.toHaveTextContent('; ');
    expect(citation2).toHaveTextContent('; ');
  });

  it('should move a cursor that is after the closing bracket to the position before the bracket', () => {
    const [position] = setUpEditorWithSelection(editor, '<p><citation>Citation|</citation></p>');
    editor.commands.setTextSelection(position + 1);
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p><citation>Citation|</citation></p>
      </notionblock>"
    `);
  });

  it('should move a cursor that is after the opening bracket to the position before the bracket', () => {
    const [position] = setUpEditorWithSelection(editor, '<p>Paragraph<citation>C|itation</citation></p>');
    editor.commands.setTextSelection(position - 1);
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          Paragraph|
          <citation>Citation</citation>
        </p>
      </notionblock>"
    `);
  });

  it('should create a text node before the node if needed', () => {
    const [position] = setUpEditorWithSelection(editor, '<p><citation>C|itation</citation></p>');
    editor.commands.setTextSelection(position - 1);
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          |
          <citation>Citation</citation>
        </p>
      </notionblock>"
    `);
  });

  it('should enter the node from the left', () => {
    const [position] = setUpEditorWithSelection(editor, '<p>Paragraph|<citation>Citation</citation></p>');
    editor.commands.setTextSelection(position + 1);
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          Paragraph
          <citation>C|itation</citation>
        </p>
      </notionblock>"
    `);
  });
});
