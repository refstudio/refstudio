import { IconType } from '../icons/type';

export function SideBar<SideBarPane extends string>({
  activePane,
  panes,
  footerItems,
  onItemClick,
}: {
  activePane: SideBarPane | null;
  panes: { pane: SideBarPane; Icon: IconType }[];
  footerItems?: { label: string; Icon: IconType; onClick: () => void }[];
  onItemClick: (pane: SideBarPane) => void;
}) {

  return (
    <div className="flex select-none flex-col" role="menubar">
      <div className='flex-grow flex flex-col p-2 gap-2'>
        {
          panes.map(({ pane, Icon }) => (
            <Icon
              active={pane === activePane}
              aria-label={pane}
              key={pane}
              role="menuitem"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                onItemClick(pane);
              }}
            />
          ))
        }
      </div>
      {footerItems?.length && <>
        <div className='w-full h-[1px]' style={{ backgroundColor: '#eff1f4' }} />
        <div className='flex flex-col p-2 gap-2'>
          {footerItems.map(({ label, Icon, onClick }) => (<Icon
            aria-label={label}
            key={label}
            role="menuitem"
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              onClick();
            }}
          />))}
        </div>
      </>}
    </div>
  );
}
