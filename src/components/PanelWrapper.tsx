import React from 'react';

export function PanelWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 flex-grow-0 select-none border-b-2 border-t-2 border-slate-300 p-2 text-sm text-black">
        <div>{title.toUpperCase()}</div>
        <div className="ml-auto">{/* NOTE: This is a placeholder element for wrapper actions */}</div>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden pt-2">{children}</div>
    </div>
  );
}
