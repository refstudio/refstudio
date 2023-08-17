/* eslint-disable jest-dom/prefer-to-have-text-content */
import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { getTopLevelNodes } from '../getTopLevelNodes';

describe('getParent', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should return node containing the selection', () => {
    setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>|Parent</p>
      </notionblock>`,
    );

    const topLevelNodes = getTopLevelNodes(editor.state.selection);
    expect(topLevelNodes).toHaveLength(1);

    const [{ node, resolvedPos }] = topLevelNodes;
    expect(resolvedPos.pos).toBe(0);
    expect(node.child(0).textContent).toBe('Parent');
  });

  it('should only return the child node', () => {
    const [cursorPos] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent</p>
        <notionblock>
          <p>|Child</p>
        </notionblock>
      </notionblock>`,
    );

    const topLevelNodes = getTopLevelNodes(editor.state.selection);
    expect(topLevelNodes).toHaveLength(1);

    const [{ node, resolvedPos }] = topLevelNodes;
    expect(resolvedPos.pos).toBe(cursorPos - 2);
    expect(node.child(0).textContent).toBe('Child');
  });

  it('should return both the parent node', () => {
    setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>|Parent 1</p>
        <notionblock>
          <p>Child 1.1</p>
        </notionblock>
      </notionblock>
      <notionblock>
        <p>Parent 2</p>
        <notionblock>
          <p>|Child 2.1</p>
        </notionblock>
      </notionblock>`,
    );

    const topLevelNodes = getTopLevelNodes(editor.state.selection);
    expect(topLevelNodes).toHaveLength(2);

    const [{ node: firstNode, resolvedPos: firstResolvedPos }, { node: secondNode, resolvedPos: secondResolvedPos }] =
      topLevelNodes;
    expect(firstResolvedPos.pos).toBe(0);
    expect(firstNode.child(0).textContent).toBe('Parent 1');
    expect(secondResolvedPos.pos).toBe(firstNode.nodeSize);
    expect(secondNode.child(0).textContent).toBe('Parent 2');
  });

  it('should return the first children and the second parent nodes', () => {
    const [childCursor] = setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>Parent 1</p>
        <notionblock>
          <p>|Child 1.1</p>
        </notionblock>
        <notionblock>
          <p>Child 1.2</p>
        </notionblock>
      </notionblock>
      <notionblock>
        <p>Parent 2</p>
        <notionblock>
          <p>|Child 2.1</p>
        </notionblock>
        <notionblock>
          <p>Child 2.2</p>
        </notionblock>
      </notionblock>`,
    );

    const topLevelNodes = getTopLevelNodes(editor.state.selection);
    expect(topLevelNodes).toHaveLength(3);

    const [
      { node: firstNode, resolvedPos: firstResolvedPos },
      { node: secondNode, resolvedPos: secondResolvedPos },
      { node: thirdNode, resolvedPos: thirdResolvedPos },
    ] = topLevelNodes;
    expect(firstResolvedPos.pos).toBe(childCursor - 2);
    expect(firstNode.child(0).textContent).toBe('Child 1.1');
    expect(secondResolvedPos.pos).toBe(childCursor + 11);
    expect(secondNode.child(0).textContent).toBe('Child 1.2');
    expect(thirdResolvedPos.pos).toBe(editor.state.doc.nodeAt(0)!.nodeSize);
    expect(thirdNode.child(0).textContent).toBe('Parent 2');
  });

  it('should return both parent nodes', () => {
    setUpEditorWithSelection(
      editor,
      `<notionblock>
        <p>|Parent 1</p>
        <notionblock>
          <p>Child 1.1</p>
        </notionblock>
        <notionblock>
          <p>Child 1.2</p>
        </notionblock>
      </notionblock>
      <notionblock>
        <p>Parent 2</p>
        <notionblock>
          <p>|Child 2.1</p>
        </notionblock>
        <notionblock>
          <p>Child 2.2</p>
        </notionblock>
      </notionblock>`,
    );

    const topLevelNodes = getTopLevelNodes(editor.state.selection);
    expect(topLevelNodes).toHaveLength(2);

    const [{ node: firstNode, resolvedPos: firstResolvedPos }, { node: secondNode, resolvedPos: secondResolvedPos }] =
      topLevelNodes;
    expect(firstResolvedPos.pos).toBe(0);
    expect(firstNode.child(0).textContent).toBe('Parent 1');
    expect(secondResolvedPos.pos).toBe(firstNode.nodeSize);
    expect(secondNode.child(0).textContent).toBe('Parent 2');
  });
});
