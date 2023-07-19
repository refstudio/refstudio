import { Editor } from '@tiptap/react';
import { createStore } from 'jotai';

import { setReferencesAtom } from '../../../../../../atoms/referencesState';
import { noop } from '../../../../../../lib/noop';
import { screen, setupWithJotaiProvider } from '../../../../../../test/test-utils';
import { REFERENCES } from '../../../../../references/__tests__/test-fixtures';
import { EDITOR_EXTENSIONS } from '../../../tipTapEditorConfigs';
import { ReferencesListPopup } from '../ReferencesListPopup';

describe('ReferencesListPopup component', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    store.set(setReferencesAtom, REFERENCES);
  });

  it('should render the list of references', () => {
    setupWithJotaiProvider(
      <ReferencesListPopup
        command={noop}
        decorationNode={null}
        editor={editor}
        items={[]}
        query=""
        range={{
          from: 0,
          to: 0,
        }}
        text=""
      />,
      store,
    );
    expect(screen.getAllByRole('button')).toHaveLength(REFERENCES.length);
  });

  it('should use the query to suggest references', () => {
    setupWithJotaiProvider(
      <ReferencesListPopup
        command={noop}
        decorationNode={null}
        editor={editor}
        items={[]}
        query={REFERENCES[1].title}
        range={{
          from: 0,
          to: 0,
        }}
        text=""
      />,
      store,
    );
    const [firstReference] = screen.getAllByRole('button');
    expect(firstReference).toHaveTextContent(REFERENCES[1].title);
  });

  it('should call command', async () => {
    const mockedCommand = vi.fn();
    const { user } = setupWithJotaiProvider(
      <ReferencesListPopup
        command={mockedCommand}
        decorationNode={null}
        editor={editor}
        items={[]}
        query=""
        range={{
          from: 0,
          to: 0,
        }}
        text=""
      />,
      store,
    );

    const [firstReference] = screen.getAllByRole('button');
    expect(firstReference).toBeInTheDocument();
    await user.click(firstReference);

    expect(mockedCommand).toHaveBeenCalledTimes(1);
    expect(mockedCommand).toHaveBeenCalledWith({ id: REFERENCES[0].id });
  });

  it('should display "No Result" when no references are available', () => {
    store.set(setReferencesAtom, []);
    setupWithJotaiProvider(
      <ReferencesListPopup
        command={noop}
        decorationNode={null}
        editor={editor}
        items={[]}
        query=""
        range={{
          from: 0,
          to: 0,
        }}
        text=""
      />,
      store,
    );
    expect(screen.getByText('No result')).toBeInTheDocument();
  });
});
