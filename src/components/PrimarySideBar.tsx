import { IconType } from 'react-icons';
import { VscFiles, VscLibrary, VscSettingsGear } from 'react-icons/vsc';

import { cx } from '../cx';

export type PrimarySideBarPane = 'Explorer' | 'References' | '';

export function PrimarySideBar({
  activePane,
  onClick,
  onSettingsClick,
}: {
  activePane: PrimarySideBarPane | null;
  onClick: (clicked: PrimarySideBarPane) => void;
  onSettingsClick: () => void;
}) {
  const panes: { pane: PrimarySideBarPane; Icon: IconType }[] = [
    { pane: 'Explorer', Icon: VscFiles },
    { pane: 'References', Icon: VscLibrary },
  ];
  return (
    <div className="flex select-none flex-col gap-1 bg-black text-white" role="menubar">
      {panes.map(({ pane, Icon }) => (
        <Icon
          aria-label={pane}
          className={cx('cursor-pointer p-4 hover:opacity-100', {
            'border-l-2 border-l-transparent opacity-50': activePane !== pane,
            'border-l-2 border-l-primary opacity-100': activePane === pane,
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
      <VscSettingsGear
        className={cx('mt-auto cursor-pointer p-4 hover:opacity-100', {
          'border-l-2 border-l-transparent opacity-50': true,
          'border-l-2 border-l-primary opacity-100': false,
        })}
        role="menuitem"
        size={60}
        onClick={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          onSettingsClick();
        }}
      />
    </div>
  );
}
