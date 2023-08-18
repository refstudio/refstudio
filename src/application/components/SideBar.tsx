import './SideBar.css';

import { cx } from '../../lib/cx';

interface SideBarProps<SideBarPane> {
  activePane: SideBarPane | null;
  items: { pane: SideBarPane; Icon: React.ReactElement }[];
  footerItems?: { label: string; Icon: React.ReactElement; onClick: () => void }[];
  position: 'left' | 'right';
  onItemClick: (pane: SideBarPane) => void;
}
export function SideBar<SideBarPane extends string>({
  activePane,
  items,
  footerItems,
  position,
  onItemClick,
}: SideBarProps<SideBarPane>) {
  return (
    <div className={cx('side-bar', position)} role="menubar">
      <div className="flex flex-grow flex-col gap-2 p-2">
        {items.map(({ pane, Icon }) => (
          <IconButton active={pane === activePane} key={pane} onClick={() => onItemClick(pane)}>
            {Icon}
          </IconButton>
        ))}
      </div>
      {footerItems?.length && (
        <>
          <div className="h-[1px] w-full" style={{ backgroundColor: '#eff1f4' }} />
          <div className="flex flex-col gap-2 p-2">
            {footerItems.map(({ label, Icon, onClick }) => (
              <IconButton key={label} onClick={onClick}>
                {Icon}
              </IconButton>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function IconButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      className={cx('icon cursor-pointer', { active })}
      role="menuitem"
      onClick={(evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        onClick();
      }}
    >
      <div className="self-center">{children}</div>
    </div>
  );
}
