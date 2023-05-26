import React from 'react';

export function PanelWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-full">
      <div className="select-none border-b-2 border-t-2 border-slate-300 p-2 text-sm text-black">
        {title.toUpperCase()}
      </div>
      <div className="h-full">{children}</div>
    </div>
  );
}
