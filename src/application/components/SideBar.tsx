import './SideBar.css';

import { cx } from '../../lib/cx';

interface SideBarProps<SideBarPane> {
  activePane: SideBarPane | null;
  className?: string;
  items: { pane: SideBarPane; Icon: React.ReactElement }[];
  footerItems?: { label: string; Icon: React.ReactElement; onClick: () => void }[];
  onItemClick: (pane: SideBarPane) => void;
}
export function SideBar<SideBarPane extends string>({
  activePane,
  className,
  items,
  footerItems,
  onItemClick,
}: SideBarProps<SideBarPane>) {
  return (
    <div className={cx('side-bar', className)} role="menubar">
      <div className="flex flex-grow flex-col gap-2 p-2">
        {items.map(({ pane, Icon }) => (
          <IconButton active={pane === activePane} key={pane} onClick={() => onItemClick(pane)}>
            {Icon}
          </IconButton>
        ))}
      </div>
      {footerItems?.length && (
        <div className="flex flex-col gap-2 border-t-[1px] border-t-side-bar-border p-2">
          {footerItems.map(({ label, Icon, onClick }) => (
            <IconButton key={label} onClick={onClick}>
              {Icon}
            </IconButton>
          ))}
        </div>
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
