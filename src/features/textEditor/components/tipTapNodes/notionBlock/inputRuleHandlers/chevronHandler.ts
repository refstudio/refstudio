import { Range, SingleCommands } from '@tiptap/core';
import { NodeType } from 'prosemirror-model';

export function chevronHandler(
  this: { type: NodeType },
  { commands, range: { from, to } }: { commands: SingleCommands; range: Range },
) {
  const { name: nodeName } = this.type;
  commands.command(({ tr, dispatch }) => {
    const resolvedFrom = tr.doc.resolve(from);

    if (resolvedFrom.node(-1).type.name !== nodeName) {
      return false;
    }

    if (dispatch) {
      tr.replace(from, to);
      tr.setNodeAttribute(resolvedFrom.before(-1), 'type', 'collapsible');
    }
    return true;
  });
}
