import React from 'react';

export function PanelWrapper({
  title,
  children,
}: {
  title: string;
  closable?: boolean;
  onCloseClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-start self-stretch bg-side-bar-bg-primary text-side-bar-txt">
      <div className="g-2 flex items-start self-stretch p-4">
        <h1 className="self-stretch">{title}</h1>
      </div>
      {children}
    </div>
  );
}
