import { Node, ResolvedPos, Slice } from '@tiptap/pm/model';
import { Selection, Transaction } from '@tiptap/pm/state';
import { Mappable } from '@tiptap/pm/transform';

import { getNextSibling } from '../utils/getNextSibling';
import { getNotionBlockParent } from '../utils/getNotionBlockParent';
import { getParent } from '../utils/getParent';
import { getPreviousSibling } from '../utils/getPreviousSibling';
import { NodeData } from '../utils/types';

export class BlockSelection extends Selection {
  static all(doc: Node): Selection {
    let lastChildPos = 0;
    doc.forEach((_child, offset, index) => {
      if (index === doc.childCount - 1) {
        lastChildPos = offset;
      }
    });

    return new BlockSelection(doc.resolve(0), doc.resolve(lastChildPos));
  }

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
    const $anchor = doc.resolve(mapping.map(this.anchor));
    const $head = doc.resolve(mapping.map(this.head));
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
    const { parentBlock } = this;
    if (!parentBlock) {
      return false;
    }
    tr.setSelection(new BlockSelection(parentBlock.resolvedPos));
    dispatch(tr);
    return true;
  }

  selectChildBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const { childBlock } = this;
    if (!childBlock) {
      return false;
    }
    tr.setSelection(new BlockSelection(childBlock.resolvedPos));
    dispatch(tr);
    return true;
  }

  selectNextBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const { childBlock, nextBlock } = this;
    if (!childBlock && !nextBlock) {
      return false;
    }

    tr.setSelection(new BlockSelection((childBlock ?? nextBlock)!.resolvedPos));
    dispatch(tr);
    return true;
  }

  selectPreviousBlock(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const { previousOrParentBlock } = this;
    if (!previousOrParentBlock) {
      return false;
    }

    tr.setSelection(new BlockSelection(previousOrParentBlock.resolvedPos));
    dispatch(tr);
    return true;
  }

  extendDown(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const { nextBlock } = this;
    if (nextBlock) {
      tr.setSelection(new BlockSelection(this.$anchor, nextBlock.resolvedPos));
      dispatch(tr);
      return true;
    }
    return false;
  }

  extendUp(tr: Transaction, dispatch: (tr: Transaction) => void): boolean {
    const { previousOrParentBlock: previousBlock } = this;
    const doc = this.$head.node(0);
    if (previousBlock) {
      let newResolvedHead = previousBlock.resolvedPos;
      let newResolvedAnchor = this.$anchor;
      // If the head is before the anchor, we need to make sure the anchor's depth is lower than the head's depth
      if (newResolvedHead.min(newResolvedAnchor).pos === newResolvedHead.pos) {
        if (newResolvedAnchor.depth > newResolvedHead.depth) {
          const anchorIndex = this.$anchor.indexAfter(newResolvedHead.depth) - 1;
          const newAnchorPos = this.$anchor.posAtIndex(anchorIndex, newResolvedHead.depth);
          newResolvedAnchor = doc.resolve(newAnchorPos);
        }
        // Otherwise, we need to make sure the head's depth is the lowest
      } else {
        if (newResolvedHead.depth > newResolvedAnchor.depth) {
          const headIndex = newResolvedHead.indexAfter(newResolvedAnchor.depth) - 1;
          const newHeadPos = newResolvedHead.posAtIndex(headIndex, newResolvedAnchor.depth);
          newResolvedHead = doc.resolve(newHeadPos);
        }
      }
      tr.setSelection(new BlockSelection(newResolvedAnchor, newResolvedHead));
      dispatch(tr);
      return true;
    }
    return false;
  }

  private get childBlock(): NodeData | null {
    const doc = this.$head.node(0);
    const currentBlock = doc.nodeAt(this.head)!;
    if ((currentBlock.attrs.type !== 'collapsible' || !currentBlock.attrs.collapsed) && currentBlock.childCount > 1) {
      const childPos = this.head + currentBlock.firstChild!.nodeSize + 1;
      const resolvedChildPos = doc.resolve(childPos);

      return { node: doc.nodeAt(childPos)!, resolvedPos: resolvedChildPos };
    }
    return null;
  }

  private get parentBlock(): NodeData | null {
    return getParent(this.$head);
  }

  private get nextBlock(): NodeData | null {
    let currentResolvedPos = this.$head;
    let nextBlock = getNextSibling(currentResolvedPos);
    while (!nextBlock) {
      const parent = getParent(currentResolvedPos);
      if (!parent) {
        // If the node is at the end of the document, it has no next block
        return null;
      }
      currentResolvedPos = parent.resolvedPos;
      nextBlock = getNextSibling(currentResolvedPos);
    }
    return nextBlock;
  }

  private get previousOrParentBlock(): NodeData | null {
    const currentResolvedPos = this.$head;
    const previousSibling = getPreviousSibling(currentResolvedPos);

    // If the block is its parent's first child, return the parent
    if (!previousSibling) {
      return this.parentBlock;
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

    return previousBlock;
  }
}

Selection.jsonID('notionBlock', BlockSelection);
