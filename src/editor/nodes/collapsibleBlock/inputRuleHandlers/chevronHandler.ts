import { CanCommands, ChainedCommands, Range } from '@tiptap/react';

export function chevronHandler({
  can,
  chain,
  range: { from, to },
}: {
  can: () => CanCommands;
  chain: () => ChainedCommands;
  range: Range;
}): void {
  if (can().setCollapsibleBlock()) {
    chain()
      .command(() => false)
      .setCollapsibleBlock()
      .deleteRange({ from: from + 1, to: to + 1 })
      .setTextSelection(from + 1)
      .toggleCollapsedCollapsibleBlock(from + 1)
      .run();
  }
}
