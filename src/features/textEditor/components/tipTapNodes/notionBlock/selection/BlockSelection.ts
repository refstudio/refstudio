import { Node, ResolvedPos, Slice } from '@tiptap/pm/model';
import { Selection, Transaction } from '@tiptap/pm/state';
import { Mappable } from '@tiptap/pm/transform';

import { getNextSibling } from '../utils/getNextSibling';
import { getNotionBlockParent } from '../utils/getNotionBlockParent';
import { getParent } from '../utils/getParent';
import { getPreviousSibling } from '../utils/getPreviousSibling';

export class BlockSelection extends Selection {
  constructor($anchor: ResolvedPos, $head = $anchor) {
    const anchorParentBlock = getNotionBlockParent($anchor);
    const headParentBlock = getNotionBlockParent($head);

    if (!anchorParentBlock || !headParentBlock) {
      throw new Error('No notion block was found near this position');
    }

    super(anchorParentBlock.resolvedPos, headParentBlock.resolvedPos);
    this.visible = false;
  }

  eq(selection: Selection): boolean {
    return selection instanceof BlockSelection && selection.anchor === this.anchor && selection.head === this.head;
  }

  map(doc: Node, mapping: Mappable): Selection {
    const $from = doc.resolve(mapping.map(this.from));
    const $to = doc.resolve(mapping.map(this.to));
    const $anchor = this.anchor === this.from ? $from : $to;
    const $head = this.head === this.to ? $from : $to;
    return new BlockSelection($anchor, $head);
  }

  content(): Slice {
    const lastNode = this.$to.node(0).nodeAt(this.to)!;
    const content = this.$from.node(0).slice(this.from, this.to + lastNode.nodeSize);

    return content;
  }

  replace(tr: Transaction, content?: Slice): void {
    const lastNode = this.$to.node(0).nodeAt(this.to)!;
    tr.replace(this.from, this.to + lastNode.nodeSize, content);
  }

  replaceWith(tr: Transaction, node: Node): void {
    const lastNode = this.$to.node(0).nodeAt(this.to)!;
    tr.replaceWith(this.from, this.to + lastNode.nodeSize, node);
  }

  toJSON() {
    return { type: 'block', anchor: this.anchor, to: this.head };
  }

  // A block selection cannot be empty, at least one block is selected
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get empty() {
    return false;
  }

  get selectedBlocksPos() {
    const selectedBlocks: { from: number; to: number }[] = [];
    const doc = this.$from.node(0);
    let i = this.from;

    while (i <= this.to) {
      let node = doc.nodeAt(i);
      while (node === null) {
        i++;
        node = doc.nodeAt(i);
      }
      const to = i + node.nodeSize;
      selectedBlocks.push({ from: i, to });
      i = to;
    }
    return selectedBlocks;
  }

  selectParentBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const parent = getParent(this.$head);
    if (!parent) {
      // If the node is the first node of the document, selectPreviousBlock does nothing
      return false;
    }
    tr.setSelection(new BlockSelection(parent.resolvedPos));
    dispatch(tr);
    return true;
  }

  selectChildBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const doc = this.$head.node(0);
    const currentBlock = doc.nodeAt(this.head)!;
    if ((currentBlock.attrs.type !== 'collapsible' || !currentBlock.attrs.collapsed) && currentBlock.childCount > 1) {
      const childPos = this.head + currentBlock.firstChild!.nodeSize + 1;
      const resolvedChildPos = doc.resolve(childPos);

      tr.setSelection(new BlockSelection(resolvedChildPos));
      dispatch(tr);
      return true;
    }
    return false;
  }

  selectNextBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    // If the selected block is not collapsed and has a child, select it
    const success = this.selectChildBlock(tr, dispatch);
    if (success) {
      return true;
    }

    // Otherwise select the next sibling
    let currentResolvedPos = this.$head;
    let nextBlock = getNextSibling(currentResolvedPos);
    while (!nextBlock) {
      const parent = getParent(currentResolvedPos);
      if (!parent) {
        // If the node is at the end of the document, selectNextBlock does nothing
        return false;
      }
      currentResolvedPos = parent.resolvedPos;
      nextBlock = getNextSibling(currentResolvedPos);
    }
    tr.setSelection(new BlockSelection(nextBlock.resolvedPos));
    dispatch(tr);
    return true;
  }

  selectPreviousBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const currentResolvedPos = this.$head;
    const previousSibling = getPreviousSibling(currentResolvedPos);

    // If the block is its parent's first child, return the parent
    if (!previousSibling) {
      return this.selectParentBlock(tr, dispatch);
    }

    // Otherwise select the deepest child of the previous sibling
    const doc = this.$head.node(0);
    let previousBlock = previousSibling;
    while (
      (previousBlock.node.attrs.type !== 'collapsible' || !previousBlock.node.attrs.collapsed) &&
      previousBlock.node.childCount > 1
    ) {
      let lastChildOffset = 1;
      previousBlock.node.forEach((_child, offset, index) => {
        if (index === previousBlock.node.childCount - 1) {
          lastChildOffset += offset;
        }
      });
      previousBlock = {
        node: previousBlock.node.lastChild!,
        resolvedPos: doc.resolve(previousBlock.resolvedPos.pos + lastChildOffset),
      };
    }

    tr.setSelection(new BlockSelection(previousBlock.resolvedPos));
    dispatch(tr);
    return true;
  }
}

Selection.jsonID('notionBlock', BlockSelection);
