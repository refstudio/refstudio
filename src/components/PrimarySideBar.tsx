import { VscFiles } from 'react-icons/vsc';

import { cx } from '../cx';

export type PrimarySideBarPane = 'Explorer' | 'References';

export function PrimarySideBar({
  activePane,
  onClick,
}: {
  activePane: PrimarySideBarPane;
  onClick: (clicked: PrimarySideBarPane) => void;
}) {
  const panes: PrimarySideBarPane[] = ['Explorer', 'References'];
  return (
    <div className="flex flex-col bg-black text-white" role="menubar">
      {panes.map((pane) => (
        <VscFiles
          aria-label={pane}
          className={cx('p-4 hover:opacity-100', {
            'border-l-2 border-l-transparent opacity-50': activePane !== pane,
            'border-l-2 border-l-blue-500 opacity-100': activePane === pane,
          })}
          key={pane}
          role="menuitem"
          size={60}
          onClick={() => onClick(pane)}
        />
      ))}
    </div>
  );
}
