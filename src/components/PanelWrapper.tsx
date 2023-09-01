import React from 'react';

import { cx } from '../lib/cx';

interface Action {
  key: string;
  disabled?: boolean;
  title: string;
  Icon: React.ReactElement;
  onClick: () => void;
}

interface PanelWrapperProps {
  title: string;
  actions?: Action[];
  children: React.ReactNode;
}
export function PanelWrapper({ title, children, actions }: PanelWrapperProps) {
  return (
    <div className="text-side-bar-txt flex h-full flex-col items-start self-stretch bg-side-bar-bg-primary">
      <div className="flex items-start gap-2 self-stretch px-4 py-3">
        <h1 className="flex flex-1 cursor-default select-none flex-col justify-center self-stretch">{title}</h1>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action) => (
              <button
                aria-disabled={action.disabled}
                className={cx(
                  'flex h-8 w-8 flex-col items-center justify-center rounded-default',
                  'bg-btn-bg-side-bar-icon-default',
                  'text-btn-ico-side-bar-icon-default',
                  {
                    'hover:bg-btn-bg-side-bar-icon-hover hover:text-btn-ico-side-bar-icon-hover': !action.disabled,
                    'bg-btn-bg-side-bar-tool-disabled text-btn-ico-side-bar-icon-disabled': action.disabled,
                  },
                )}
                disabled={action.disabled}
                key={action.key}
                title={action.title}
                onClick={action.onClick}
              >
                {action.Icon}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
