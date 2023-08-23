/* eslint-disable jest-dom/prefer-to-have-text-content */
import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { getPreviousSibling } from '../getPreviousSibling';

describe('getPreviousSibling', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it("should return the node's previous sibling", () => {
    const [siblingPos, cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent</p>
        <notionblock>
          <p>|Child 1</p>
        </notionblock>
        <notionblock>
          <p>|Child 2</p>
        </notionblock>
      </notionblock>`,
    );

    const sibling = getPreviousSibling(editor.state.doc.resolve(cursorPos - 2));
    expect(sibling).not.toBeNull();

    const { node, resolvedPos } = sibling!;

    expect(resolvedPos.pos).toBe(siblingPos - 2);
    expect(node.child(0).textContent).toBe('Child 1');
  });

  it('should return the previous top-level node', () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent 1</p>
      </notionblock>
      <notionblock>
        <p>|Parent 2</p>
      </notionblock>`,
    );

    const sibling = getPreviousSibling(editor.state.doc.resolve(cursorPos - 2));
    expect(sibling).not.toBeNull();

    const { node, resolvedPos } = sibling!;

    expect(resolvedPos.pos).toBe(0);
    expect(node.child(0).textContent).toBe('Parent 1');
  });

  it('should return null if the node is the first child of its parent', () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent</p>
        <notionblock>
          <p>|Child</p>
        </notionblock>
      </notionblock>`,
    );

    const sibling = getPreviousSibling(editor.state.doc.resolve(cursorPos - 2));
    expect(sibling).toBeNull();
  });

  it('should return null if the node is the first top-level node', () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>|Parent</p>
      </notionblock>`,
    );

    const sibling = getPreviousSibling(editor.state.doc.resolve(cursorPos - 2));
    expect(sibling).toBeNull();
  });
});
