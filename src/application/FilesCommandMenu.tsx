import { useAtomValue, useSetAtom } from 'jotai';
import { Command, CommandMenu, useCommands } from 'kmenu';
import { VscFile } from 'react-icons/vsc';

import { openFilePathAtom } from '../atoms/fileEntryActions';
import { fileExplorerAtom } from '../atoms/fileExplorerActions';
import { useOpenKmenuOnInput } from './useOpenKmenuOnInput';

export function FilesCommandMenu({ index }: { index: number }) {
  useOpenKmenuOnInput('>', index);

  const rootFileExplorerEntry = useAtomValue(fileExplorerAtom);
  const rootChildren = useAtomValue(rootFileExplorerEntry.childrenAtom);

  const openFilePath = useSetAtom(openFilePathAtom);

  const fileCommands: Command[] = [
    {
      category: 'Files',
      commands: rootChildren
        .filter((file) => !file.isFolder)
        .map((file) => ({
          icon: <VscFile />,
          text: file.name,
          perform: () => openFilePath(file.path),
        })),
    },
  ];

  const [commands] = useCommands(fileCommands);

  return <CommandMenu commands={commands} crumbs={['Files']} index={index} />;
}
