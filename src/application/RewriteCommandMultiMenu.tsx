import { useAtomValue } from 'jotai';
import { CommandMenu, useCommands, useKmenu } from 'kmenu';
import { useCallback, useEffect, useState } from 'react';
import { VscError, VscLoading, VscSettings, VscWarning } from 'react-icons/vsc';

import { askForRewrite, AskForRewriteReturn } from '../api/rewrite';
import { selectionAtom } from '../atoms/selectionState';
import { emitEvent } from '../events';
import { getMannerOptions, OpenAiManner } from '../settings/settingsManager';
import { HIDE_PLACEHOLDER_TEXT } from './CommandPaletteConfigs';

export function RewriteCommandMultiMenu({ index }: { index: number }) {
  const selection = useAtomValue(selectionAtom);
  const { open, setOpen } = useKmenu();

  const [rewriteReturn, setRewriteReturn] = useState<AskForRewriteReturn | null>(null);

  const INDEX_NO_SELECTION = index;
  const INDEX_SELECT_MANNER = index + 1;
  const INDEX_LOADING_CHOICES = index + 2;
  const INDEX_ERROR = index + 3;
  const INDEX_CHOICES = index + 4;

  const askRewrite = useCallback(
    async (manner: OpenAiManner) => {
      const res = await askForRewrite(selection, { manner });
      setRewriteReturn(res);
      setOpen(res.ok ? INDEX_CHOICES : INDEX_ERROR, true);
    },
    [selection, setOpen, INDEX_CHOICES, INDEX_ERROR],
  );

  const [commands] = useCommands([
    {
      category: 'Rewrite',
      commands: getMannerOptions().map((manner) => ({
        text: 'Rewrite ' + manner,
        perform: () => {
          setOpen(INDEX_LOADING_CHOICES, true);
          setRewriteReturn(null);
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
        index={INDEX_ERROR}
        loadingPlaceholder={
          <div className="flex items-center gap-2 bg-red-50 p-6">
            <VscError /> {rewriteReturn?.ok === false ? rewriteReturn.message : 'Unexpected Error'}
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
      {rewriteReturn?.ok && (
        <ChoicesCommandMenu choices={rewriteReturn.choices} index={INDEX_CHOICES} onSelectChoice={handleSelectChoice} />
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
