import React from 'react';
import { VscClose } from 'react-icons/vsc';

export function PanelWrapper({
  title,
  closable = false,
  onCloseClick,
  children,
}: {
  title: string;
  closable?: boolean;
  onCloseClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 flex-grow-0 select-none items-center border-b-2 border-t-2 border-slate-300 p-2 text-sm text-black">
        <div>{title.toUpperCase()}</div>
        <div className="ml-auto">
          {closable && <VscClose className="cursor-pointer" onClick={() => onCloseClick?.()} />}
        </div>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden pt-2">{children}</div>
    </div>
  );
}
