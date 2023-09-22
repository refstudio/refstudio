import { useAtomValue } from 'jotai';
import { Command } from 'kmenu';
import { SiSemanticscholar } from 'react-icons/si';

import { isProjectOpenAtom } from '../../../atoms/projectState';
import { SearchIcon } from '../../../components/icons';
import { emitEvent } from '../../../events';
import { AddIcon } from '../../components/icons';
import { ReferencesIcon } from '../../sidebar/icons';
import { INDEX_REFERENCES } from '../CommandPaletteConfigs';

export function useReferencesCommands(openPanel: (panelIndex: number) => void): Command[] {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);

  if (!isProjectOpen) {
    return [];
  }

  return [
    {
      category: 'References',
      commands: [
        {
          icon: <SearchIcon />,
          text: 'Find References...',
          perform: () => openPanel(INDEX_REFERENCES),
        },
        {
          icon: <ReferencesIcon />,
          text: 'Show References',
          perform: () => emitEvent('refstudio://menu/references/open'),
        },
        {
          icon: <AddIcon />,
          text: 'Upload References',
          perform: () => emitEvent('refstudio://menu/references/upload'),
        },
        {
          icon: <SiSemanticscholar />,
          text: 'Search Semantic Scholar',
          perform: () => emitEvent('refstudio://menu/references/search'),
        },
      ],
    },
  ];
}
