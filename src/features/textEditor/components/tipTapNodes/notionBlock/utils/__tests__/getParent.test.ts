/* eslint-disable jest-dom/prefer-to-have-text-content */
import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { getParent } from '../getParent';

describe('getParent', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it("should return the node's parent for the first child", () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent</p>
        <notionblock>
          <p>|Child</p>
        </notionblock>
      </notionblock>`,
    );

    const parent = getParent(editor.state.doc.resolve(cursorPos - 2));
    expect(parent).not.toBeNull();

    const { node, resolvedPos } = parent!;

    expect(resolvedPos.pos).toBe(0);
    expect(node.child(0).textContent).toBe('Parent');
  });

  it("should return the node's parent for the second child", () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent</p>
        <notionblock>
          <p>Child 1</p>
        </notionblock>
        <notionblock>
          <p>|Child 2</p>
        </notionblock>
      </notionblock>`,
    );

    const parent = getParent(editor.state.doc.resolve(cursorPos - 2));
    expect(parent).not.toBeNull();

    const { node, resolvedPos } = parent!;

    expect(resolvedPos.pos).toBe(0);
    expect(node.child(0).textContent).toBe('Parent');
  });

  it('should return null if the node is a top level node', () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>|Parent</p>
      </notionblock>`,
    );

    const parent = getParent(editor.state.doc.resolve(cursorPos - 2));
    expect(parent).toBeNull();
  });
});
