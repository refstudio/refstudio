import { Fragment, Schema, Slice } from '@tiptap/pm/model';
import { Transaction } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';

export function unsetCollapsibleBlock(pos: number, schema: Schema, tr: Transaction): void {
  const resolvedPos = tr.doc.resolve(pos);
  if (resolvedPos.depth < 1) {
    return;
  }

  const collapsibleNode = resolvedPos.node(-1);
  if (collapsibleNode.type.name !== schema.nodes.collapsibleBlock.name) {
    return;
  }

  const summary = collapsibleNode.child(0).content;
  const paragraph = [schema.nodes.paragraph.createChecked(null, summary)];
  const content = [schema.nodes.draggableBlock.createChecked(null, paragraph)];

  if (collapsibleNode.childCount === 2) {
    collapsibleNode.child(1).forEach((node) => {
      content.push(node);
    });
  }
  const fragment = Fragment.from(content);
  const slice = new Slice(fragment, 0, 0);

  const start = resolvedPos.before(-2);
  const end = resolvedPos.after(-2);

  const step = new ReplaceStep(start, end, slice);
  tr.step(step);
}
