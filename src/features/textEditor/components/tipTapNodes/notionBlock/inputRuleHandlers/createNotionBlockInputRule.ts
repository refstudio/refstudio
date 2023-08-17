import { InputRule } from '@tiptap/core';

import { NotionBlockNode } from '../NotionBlockNode';

/**
 * Create an input rule that turns a NotionBlock into the given type when the given Regexp is detected
 *
 * @param inputRegex Regex to detect
 * @param type type to give to the notion block
 * @returns The input rule
 */
export function createNotionBlockInputRule(inputRegex: RegExp, type: string): InputRule {
  return new InputRule({
    find: inputRegex,
    handler: ({ commands, range: { from, to } }) => {
      commands.command(({ tr, dispatch }) => {
        const resolvedFrom = tr.doc.resolve(from);

        if (resolvedFrom.node(-1).type.name !== NotionBlockNode.name || resolvedFrom.node(-1).attrs.type === type) {
          return false;
        }

        if (dispatch) {
          tr.replace(from, to);
          tr.setNodeAttribute(resolvedFrom.before(-1), 'type', type);
          tr.setNodeAttribute(resolvedFrom.before(-1), 'collapsed', null);
        }
        return true;
      });
    },
  });
}
