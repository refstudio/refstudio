import './SideBar.css';

import { cx } from '../../lib/cx';

interface SideBarProps<SideBarPane> {
  activePane: SideBarPane | null;
  className?: string;
  items: { pane: SideBarPane; Icon: React.ReactElement; disabled?: boolean }[];
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
        {items.map(({ disabled, pane, Icon }) => (
          <IconButton active={pane === activePane} disabled={disabled} key={pane} onClick={() => onItemClick(pane)}>
            {Icon}
          </IconButton>
        ))}
      </div>
      {footerItems?.length && (
        <div className="flex flex-col gap-2 border-t border-t-side-bar-border p-2">
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
  disabled,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cx('icon', { active, disabled })}
      disabled={disabled}
      role="menuitem"
      onClick={disabled ? undefined : onClick}
    >
      <div className="self-center">{children}</div>
    </button>
  );
}
