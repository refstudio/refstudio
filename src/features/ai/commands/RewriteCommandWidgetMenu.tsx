import { useAtomValue } from 'jotai';
import { CommandMenu, useCommands, useKmenu } from 'kmenu';
import { VscWarning } from 'react-icons/vsc';

import { HIDE_PLACEHOLDER_TEXT } from '../../../application/commands/CommandPaletteConfigs';
import { selectionAtom } from '../../../atoms/selectionState';
import { RewriteWidget } from '../../components/RewriteWidget';

export function RewriteCommandWidgetMenu({ index }: { index: number }) {
  const { toggle } = useKmenu();
  const selection = useAtomValue(selectionAtom);
  const [commands] = useCommands([
    {
      category: 'Rewrite',
      commands: [],
    },
  ]);

  if (!selection) {
    return (
      <CommandMenu
        commands={commands}
        crumbs={['Rewrite']}
        index={index}
        loadingPlaceholder={
          <div className="flex items-center gap-2 bg-yellow-100/50 p-6">
            <VscWarning /> You need to <strong>select some text</strong> to use this command.
          </div>
        }
        loadingState
        placeholder={HIDE_PLACEHOLDER_TEXT}
      />
    );
  }

  return (
    <CommandMenu
      commands={commands}
      crumbs={['Rewrite']}
      index={index}
      loadingPlaceholder={<RewriteWidget className="!p-2" selection={selection} onChoiceSelected={toggle} />}
      loadingState
      placeholder={HIDE_PLACEHOLDER_TEXT}
    />
  );
}
