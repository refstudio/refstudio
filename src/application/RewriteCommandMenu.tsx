import { useAtomValue } from 'jotai';
import { Command, CommandMenu, useCommands, useKmenu } from 'kmenu';
import { useCallback, useState } from 'react';
import { VscWarning } from 'react-icons/vsc';

import { askForRewrite } from '../api/rewrite';
import { selectionAtom } from '../atoms/selectionState';

export function RewriteCommandMenu({ index }: { index: number }) {
  const { open } = useKmenu();
  const active = open === index;

  const selection = useAtomValue(selectionAtom);

  const [choices, setChoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const initialCommands: Command[] = [
    {
      category: 'Rewrite',
      commands: [],
    },
  ];

  const [commands, setCommands] = useCommands(initialCommands);

  const loadChoices = useCallback(() => {
    if (!active) {
      return setChoices([]);
    }
    setLoading(true);
    void askForRewrite(selection, {
      nChoices: 3,
    }).then((rewriteChoices) => {
      setChoices(rewriteChoices);
      setCommands([
        {
          category: 'Rewrite',
          commands: choices.map((choice, idx) => ({
            text: choice,
            icon: <span>#{idx + 1}</span>,
          })),
        },
      ]);
      setLoading(false);
    });
  }, [active, selection, setCommands, choices]);

  return (
    <CommandMenu
      commands={commands}
      crumbs={['Rewrite']}
      index={index}
      loadingPlaceholder={
        selection.length === 0 ? (
          <div className="flex items-center gap-2 bg-yellow-100/50 p-6">
            <VscWarning /> You need to <strong>select some text</strong> to use this command.
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-primary/20 p-6">
            <strong>SELECTION</strong>
            <div>
              <small>{selection}</small>
            </div>

            <div>CONFIGS: ...</div>
            <span className="btn-primary" onClick={loadChoices}>
              REWRITE
            </span>
          </div>
        )
      }
      loadingState={loading || choices.length === 0}
      placeholder={
        selection.length === 0
          ? ' '
          : choices.length === 0
          ? 'Configure options and press REWRITE'
          : loading
          ? 'Loading rewrite options...'
          : 'Select rewrite option...'
      }
    />
  );
}
