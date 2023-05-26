import { VscFiles, VscLibrary } from 'react-icons/vsc';

import { cx } from '../cx';

export type PrimarySideBarPane = 'Explorer' | 'References';

export function PrimarySideBar({
  activePane,
  onClick,
}: {
  activePane: PrimarySideBarPane;
  onClick: (clicked: PrimarySideBarPane) => void;
}) {
  return (
    <div className="flex flex-col bg-black text-white">
      <VscFiles
        size={60}
        onClick={() => onClick('Explorer')}
        className={cx('p-4 hover:opacity-100', {
          'border-l-2 border-l-transparent opacity-50': activePane !== 'Explorer',
          'border-l-2 border-l-blue-500 opacity-100': activePane === 'Explorer',
        })}
      />
      <VscLibrary
        size={60}
        onClick={() => onClick('References')}
        className={cx('p-4 hover:opacity-100', {
          'border-l-2 border-l-transparent opacity-50': activePane !== 'References',
          'border-l-2 border-l-blue-500 opacity-100': activePane === 'References',
        })}
      />
    </div>
  );
}
