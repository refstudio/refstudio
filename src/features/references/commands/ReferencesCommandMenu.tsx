import { useAtomValue, useSetAtom } from 'jotai';
import { CommandMenu, useCommands } from 'kmenu';
import { CategoryCommand } from 'kmenu/dist/types';

import { useOpenKmenuOnInput } from '../../../application/commands/useOpenKmenuOnInput';
import { openReferenceAtom } from '../../../atoms/editorActions';
import { getReferencesAtom } from '../../../atoms/referencesState';

export function ReferencesCommandMenu({ index }: { index: number }) {
  useOpenKmenuOnInput('@', index);

  const references = useAtomValue(getReferencesAtom);
  const openReference = useSetAtom(openReferenceAtom);

  const [commands] = useCommands([
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
  ]);

  return <CommandMenu commands={commands} crumbs={['References']} index={index} placeholder="Search references" />;
}
