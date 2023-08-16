import { clearMocks } from '@tauri-apps/api/mocks';

import { runGetAtomHook } from '../../../../atoms/__tests__/test-utils';
import { selectionAtom } from '../../../../atoms/selectionState';
import { EditorContent } from '../../../../atoms/types/EditorContent';
import { buildEditorId } from '../../../../atoms/types/EditorData';
import { RefStudioEventName } from '../../../../events';
import { noop } from '../../../../lib/noop';
import {
  act,
  mockListenEvent,
  render,
  screen,
  setup,
  setupWithJotaiProvider,
  waitFor,
} from '../../../../test/test-utils';
import { TipTapEditor } from '../TipTapEditor';
import { createTextContent, emptyParagraphContent } from './test-fixtures';

const insertContentEvent: RefStudioEventName = 'refstudio://ai/suggestion/insert';

vi.mock('../../../../events');

describe('TipTapEditor', () => {
  const editorId = buildEditorId('refstudio', 'test');
  afterEach(() => {
    clearMocks();
  });

  it('should render editor with initial content', () => {
    const initialText = 'Initial content';
    const initialContent = createTextContent(initialText);

    setup(
      <TipTapEditor
        editorContent={initialContent}
        editorId={editorId}
        isActive={true}
        saveFileInMemory={noop}
        updateFileBuffer={noop}
      />,
    );

    expect(screen.getByText(initialText)).toBeInTheDocument();
  });

  it(`should listen to ${insertContentEvent} events`, () => {
    const mockData = mockListenEvent();
    render(
      <TipTapEditor
        editorContent={emptyParagraphContent}
        editorId={editorId}
        isActive={true}
        saveFileInMemory={noop}
        updateFileBuffer={noop}
      />,
    );

    expect(mockData.registeredEventNames).toContain(insertContentEvent);
  });

  it(`should update editor when ${insertContentEvent} event is triggered`, () => {
    const { trigger } = mockListenEvent();
    render(
      <TipTapEditor
        editorContent={emptyParagraphContent}
        editorId={editorId}
        isActive={true}
        saveFileInMemory={noop}
        updateFileBuffer={noop}
      />,
    );

    const insertedContent = 'inserted content';
    act(() => {
      trigger(insertContentEvent, { text: insertedContent });
    });

    expect(screen.getByText(insertedContent)).toBeInTheDocument();
  });

  it(`should not update editor when ${insertContentEvent} event is triggered but the editor is not active`, () => {
    const { trigger } = mockListenEvent();
    render(
      <TipTapEditor
        editorContent={emptyParagraphContent}
        editorId={editorId}
        isActive={false}
        saveFileInMemory={noop}
        updateFileBuffer={noop}
      />,
    );

    const insertedContent = 'inserted content';
    act(() => {
      trigger(insertContentEvent, { text: insertedContent });
    });

    expect(screen.queryByText(insertedContent)).not.toBeInTheDocument();
  });

  // Skipping because updating selection does not work.
  // My feeling is it cannot be handled because there is no actual window, with actual dimensions in the test
  it.skip('should update selection atom when selection changes', async () => {
    const initialText = 'Initial content';
    const initialContent = createTextContent(initialText);

    const { store, user } = setupWithJotaiProvider(
      <TipTapEditor
        editorContent={initialContent}
        editorId={editorId}
        isActive={false}
        saveFileInMemory={noop}
        updateFileBuffer={noop}
      />,
    );
    const selection = runGetAtomHook(selectionAtom, store);

    const textElement = screen.getByText(initialText);
    await user.pointer([{ target: textElement, offset: 0 }, { offset: 7 }]);

    await waitFor(() => expect(selection.current).toBe(initialText.slice(0, 7)));
  });

  it.skip('should save content in buffer on update', async () => {
    const initialText = 'Initial Content';
    const initialContent = createTextContent(initialText);
    const updateFileBuffer = vi.fn<[EditorContent], undefined>();

    const { user } = setupWithJotaiProvider(
      <TipTapEditor
        editorContent={initialContent}
        editorId={editorId}
        isActive={false}
        saveFileInMemory={noop}
        updateFileBuffer={updateFileBuffer}
      />,
    );

    const update = 'update';
    const textElement = screen.getByText(initialText);
    await user.click(textElement);
    await user.keyboard(update);

    await waitFor(() => expect(updateFileBuffer).toHaveBeenCalledTimes(1));
    const callParameters = updateFileBuffer.mock.lastCall;
    expect(callParameters).toStrictEqual<EditorContent>({
      type: 'refstudio',
      jsonContent: { type: 'doc', content: [{ type: 'text', text: initialText + update }] },
    });
  });
});
