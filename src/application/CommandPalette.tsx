import './CommandPalette.css';

import { useAtomValue, useSetAtom } from 'jotai';
import { Command, CommandMenu, CommandWrapper, useCommands, useKmenu } from 'kmenu';
import { CategoryCommand } from 'kmenu/dist/types';
import { VscBell, VscClose, VscGear, VscLibrary, VscNewFile, VscSearch } from 'react-icons/vsc';

import { openReferenceAtom } from '../atoms/editorActions';
import { getReferencesAtom } from '../atoms/referencesState';
import { emitEvent } from '../events';

export function CommandPalette() {
  const { setOpen } = useKmenu();

  const main: Command[] = [
    {
      category: 'Actions',
      commands: [
        {
          icon: <VscNewFile />,
          text: 'New File',
          perform: () => emitEvent('refstudio://menu/file/new'),
        },
        {
          icon: <VscClose />,
          text: 'Close Active Editor',
          perform: () => emitEvent('refstudio://menu/file/close'),
        },
      ],
      // Commands that aren't visible to the user (only after search)
      subCommands: [
        {
          icon: <VscBell />,
          text: 'Toggle Notifications Popup',
          perform: () => emitEvent('refstudio://menu/view/notifications'),
        },
        {
          icon: <VscGear />,
          text: 'Open Settings',
          perform: () => emitEvent('refstudio://menu/settings'),
        },
      ],
    },
    {
      category: 'References',
      commands: [
        {
          icon: <VscSearch />,
          text: 'Find Reference...',
          perform: () => setOpen(2),
        },
        {
          icon: <VscLibrary />,
          text: 'Open References',
          perform: () => emitEvent('refstudio://menu/references/open'),
        },
        {
          icon: <VscNewFile />,
          text: 'Upload References',
          perform: () => emitEvent('refstudio://menu/references/upload'),
        },
      ],
    },
  ];

  const [mainCommands] = useCommands(main);

  return (
    <div className="command-palette">
      <CommandWrapper>
        <CommandMenu commands={mainCommands} crumbs={[]} index={1} placeholder="Search commands" />
        <ReferencesCommandMenu index={2} />
      </CommandWrapper>
    </div>
  );
}

function ReferencesCommandMenu({ index }: { index: number }) {
  const references = useAtomValue(getReferencesAtom);
  const openReference = useSetAtom(openReferenceAtom);

  const commands: Command[] = [
    {
      category: 'References',
      commands: references.map(
        (reference) =>
          ({
            text: reference.title,
            perform: () => openReference(reference.id),
          } as CategoryCommand),
      ),
    },
  ];

  const [referencesCommands] = useCommands(commands);

  return (
    <CommandMenu commands={referencesCommands} crumbs={['References']} index={index} placeholder="Search references" />
  );
}
