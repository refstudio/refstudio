import { useAtomValue } from 'jotai';
import { CommandMenu, useCommands, useKmenu } from 'kmenu';
import { useCallback, useEffect, useState } from 'react';
import { VscLoading, VscSettings, VscWarning } from 'react-icons/vsc';

import { askForRewrite } from '../api/rewrite';
import { selectionAtom } from '../atoms/selectionState';
import { emitEvent } from '../events';
import { getMannerOptions, OpenAiManner } from '../settings/settingsManager';
import { HIDE_PLACEHOLDER_TEXT } from './CommandPaletteConfigs';

export function RewriteCommandMultiMenu({ index }: { index: number }) {
  const selection = useAtomValue(selectionAtom);
  const { open, setOpen } = useKmenu();

  const [choices, setChoices] = useState<string[]>([]);

  const INDEX_NO_SELECTION = index;
  const INDEX_SELECT_MANNER = index + 1;
  const INDEX_LOADING_CHOICES = index + 2;
  const INDEX_CHOICES = index + 3;

  const askRewrite = useCallback(
    async (manner: OpenAiManner) => {
      const rewriteChoices = await askForRewrite(selection, { manner });
      setChoices(rewriteChoices);
      setOpen(INDEX_CHOICES, true);
    },
    [selection, setOpen, INDEX_CHOICES],
  );

  const [commands] = useCommands([
    {
      category: 'Rewrite',
      commands: getMannerOptions().map((manner) => ({
        text: 'Rewrite ' + manner,
        perform: () => {
          setOpen(INDEX_LOADING_CHOICES, true);
          setChoices([]);
          void askRewrite(manner);
        },
      })),
    },
  ]);

  const handleSelectChoice = useCallback((text: string) => {
    emitEvent('refstudio://ai/suggestion/insert', { text });
  }, []);

  useEffect(() => {
    if (selection && open === index && index !== INDEX_SELECT_MANNER) {
      setOpen(INDEX_SELECT_MANNER, true);
    }
  }, [selection, open, index, setOpen, INDEX_SELECT_MANNER]);

  return (
    <>
      <CommandMenu
        commands={commands}
        crumbs={['Rewrite']}
        index={INDEX_NO_SELECTION}
        loadingPlaceholder={
          <div className="flex items-center gap-2 bg-yellow-100/50 p-6">
            <VscWarning /> You need to <strong>select some text</strong> to use this command.
          </div>
        }
        loadingState
        placeholder={HIDE_PLACEHOLDER_TEXT}
      />
      <CommandMenu
        commands={commands}
        crumbs={['Rewrite']}
        index={INDEX_LOADING_CHOICES}
        loadingPlaceholder={
          <div className="flex items-center gap-2 bg-primary/50 p-6">
            <VscLoading className="animate-spin" /> Loading choices...
          </div>
        }
        loadingState
        placeholder={HIDE_PLACEHOLDER_TEXT}
      />
      <CommandMenu
        commands={commands}
        crumbs={['Rewrite']}
        index={INDEX_SELECT_MANNER}
        placeholder="Select rewrite manner"
      />
      {choices.length > 0 && (
        <ChoicesCommandMenu choices={choices} index={INDEX_CHOICES} onSelectChoice={handleSelectChoice} />
      )}
    </>
  );
}

function ChoicesCommandMenu({
  index,
  choices,
  onSelectChoice,
}: {
  index: number;
  choices: string[];
  onSelectChoice: (choice: string) => void;
}) {
  const [commands] = useCommands([
    {
      category: 'Rewrite',
      commands: choices.map((choice) => ({
        text: choice,
        icon: <VscSettings />,
        perform: () => onSelectChoice(choice),
      })),
    },
  ]);

  return <CommandMenu commands={commands} crumbs={['Rewrite']} index={index} placeholder="Select rewrite choice" />;
}
