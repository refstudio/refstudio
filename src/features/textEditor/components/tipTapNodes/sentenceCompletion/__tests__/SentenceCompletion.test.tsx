import { Editor, EditorContent } from '@tiptap/react';

import { completeSentence } from '../../../../../../api/completion';
import { act, screen, setup, waitFor } from '../../../../../../test/test-utils';
import { EDITOR_EXTENSIONS } from '../../../tipTapEditorConfigs';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../__tests__/test-utils';
import { sentenceCompletionCommand } from '../helpers/sentenceCompletionCommand';
import { sentenceCompletionPluginKey } from '../SentenceCompletion';

vi.mock('../../../../../../api/completion');

global.document.elementFromPoint = vi.fn();

describe('SentenceCompletion extension', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  let resolveCompletionChoices: (choices: string[]) => void;

  beforeEach(() => {
    vi.mocked(completeSentence).mockImplementation(
      () =>
        new Promise<string[]>((res) => {
          resolveCompletionChoices = res;
        }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send text to complete to the api', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    await waitFor(() => expect(vi.mocked(completeSentence)).toHaveBeenCalledTimes(1));
    expect(vi.mocked(completeSentence)).toHaveBeenCalledWith('Sentence to complete');
  });

  it('should only send text before the cursor to the api', () => {
    setUpEditorWithSelection(editor, 'Sentence to| complete');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    expect(vi.mocked(completeSentence)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(completeSentence)).toHaveBeenCalledWith('Sentence to');
  });

  it('should not call the api is the selection is not empty', () => {
    setUpEditorWithSelection(editor, 'Sentence to| complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    expect(vi.mocked(completeSentence)).not.toHaveBeenCalled();
  });

  it('should display ellipsis while the result is pending', () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should display the first choice when the api result is available', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    act(() => resolveCompletionChoices(['Choice 1', 'Choice 2']));

    expect(await screen.findByText('Choice 1')).toBeInTheDocument();
  });

  it('should not update the editor content if the suggestion has not been accepted yet', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);

    act(() => resolveCompletionChoices(['Choice 1', 'Choice 2']));
    expect(await screen.findByText('Choice 1')).toBeInTheDocument();

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(
      '"<notionblock><p>Sentence to complete|</p></notionblock>"',
    );
  });

  it('should cycle through choices', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    act(() => resolveCompletionChoices(['Choice 1', 'Choice 2']));
    expect(await screen.findByText('Choice 1')).toBeInTheDocument();

    editor.commands.command(sentenceCompletionCommand);
    expect(screen.getByText('Choice 2')).toBeInTheDocument();

    editor.commands.command(sentenceCompletionCommand);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();

    expect(vi.mocked(completeSentence)).toHaveBeenCalledTimes(1);
  });

  it('should display an error message if the api response is empty', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    act(() => resolveCompletionChoices([]));

    expect(await screen.findByText('Sentence completion returned no result')).toBeInTheDocument();
  });

  it('should retry when an error occured and the command is run again', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    act(() => resolveCompletionChoices([]));

    expect(await screen.findByText('Sentence completion returned no result')).toBeInTheDocument();

    editor.commands.command(sentenceCompletionCommand);
    expect(vi.mocked(completeSentence)).toHaveBeenCalledTimes(2);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should remove the error message when any transaction is dispatched', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    setup(<EditorContent editor={editor} />);

    editor.commands.command(sentenceCompletionCommand);
    act(() => resolveCompletionChoices([]));

    expect(await screen.findByText('Sentence completion returned no result')).toBeInTheDocument();

    act(() => editor.view.dispatch(editor.state.tr));
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('should close the suggestion widget when pressing Escape', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    const { user } = setup(<EditorContent editor={editor} />);

    await user.click(screen.getByText('Sentence to complete'));
    editor.commands.command(sentenceCompletionCommand);
    await user.keyboard('{Escape}');

    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it.each(['Tab', 'Enter', 'ArrowRight'])('should accept the suggestion when pressing %s', async (key) => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    const { user } = setup(<EditorContent editor={editor} />);

    await user.click(screen.getByText('Sentence to complete'));
    editor.commands.command(sentenceCompletionCommand);
    act(() => resolveCompletionChoices(['completed!']));
    expect(await screen.findByText('completed!')).toBeInTheDocument();
    await user.keyboard(`{${key}}`);

    expect(getPrettyHTMLWithSelection(editor)).toBe(
      '<notionblock><p>Sentence to completecompleted!|</p></notionblock>',
    );
  });

  it('should not catch key events if the widget is closed', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    const { user } = setup(<EditorContent editor={editor} />);

    await user.click(screen.getByText('Sentence to complete'));
    await act(() => editor.commands.command(sentenceCompletionCommand));
    await user.keyboard('{Escape}');
    await user.keyboard('{Enter}');

    expect(screen.queryByText('...')).not.toBeInTheDocument();
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock><p>Sentence to complete</p></notionblock>
      <notionblock><p>|</p></notionblock>"
    `);
  });

  it('should not catch key events other than Enter, Escape, Tab and ArrowRight', async () => {
    // This is not ideal, but we need to mock these methods that are called by prosemirror
    window.Range.prototype.getClientRects = vi.fn().mockImplementation(() => []);
    window.Range.prototype.getBoundingClientRect = vi.fn().mockImplementation(() => ({ width: 0 }));

    setUpEditorWithSelection(editor, 'Sentence to complete|');
    const { user } = setup(<EditorContent editor={editor} />);

    await user.click(screen.getByText('Sentence to complete'));
    editor.commands.command(sentenceCompletionCommand);
    await user.keyboard('a');

    await waitFor(() => expect(screen.queryByText('...')).not.toBeInTheDocument());
    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(
      '"<notionblock><p>Sentence to completea|</p></notionblock>"',
    );
  });

  it('should not do anything if the api response is received after the widget has been closed', async () => {
    setUpEditorWithSelection(editor, 'Sentence to complete|');
    const { user } = setup(<EditorContent editor={editor} />);

    await user.click(screen.getByText('Sentence to complete'));
    editor.commands.command(sentenceCompletionCommand);
    await user.keyboard('{Escape}');

    act(() => resolveCompletionChoices(['Choice 1']));

    expect(screen.queryByText('Choice 1')).not.toBeInTheDocument();
  });

  it('should throw an error when the metadata is invalid', () => {
    setup(<EditorContent editor={editor} />);
    const invalidMetadata = { [Symbol.toStringTag]: 'Invalid metadata' };
    expect(() =>
      editor.view.dispatch(editor.state.tr.setMeta(sentenceCompletionPluginKey, invalidMetadata)),
    ).toThrowErrorMatchingInlineSnapshot('"Reached the unreachable: [object Invalid metadata]"');
  });
});
