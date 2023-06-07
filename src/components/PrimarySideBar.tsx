import { VscFiles, VscLibrary } from 'react-icons/vsc';

import { IconType } from 'react-icons';
import { cx } from '../cx';

export type PrimarySideBarPane = 'Explorer' | 'References';

export function PrimarySideBar({
  activePane,
  onClick,
}: {
  activePane: PrimarySideBarPane | null;
  onClick: (clicked: PrimarySideBarPane) => void;
}) {
  const panes: { pane: PrimarySideBarPane; Icon: IconType }[] = [
    { pane: 'Explorer', Icon: VscFiles },
    { pane: 'References', Icon: VscLibrary },
  ];
  return (
    <div className="flex select-none flex-col bg-black text-white" role="menubar">
      {panes.map(({ pane, Icon }) => (
        <Icon
          aria-label={pane}
          className={cx('p-4 hover:opacity-100', {
            'border-l-2 border-l-transparent opacity-50': activePane !== pane,
            'border-l-2 border-l-blue-500 opacity-100': activePane === pane,
          })}
          key={pane}
          role="menuitem"
          size={60}
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            onClick(pane);
          }}
        />
      ))}
    </div>
  );
}
