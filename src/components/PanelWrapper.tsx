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
    <div className="flex h-full flex-col items-start self-stretch bg-side-bar-bg-primary text-side-bar-txt">
      <div className="flex items-start gap-2 self-stretch px-4 py-3">
        <h1 className="flex-1 self-stretch">{title}</h1>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action) => (
              <button
                aria-disabled={action.disabled}
                className={cx(
                  'flex h-8 w-8 flex-col items-center justify-center rounded-default',
                  'bg-btn-bg-side-bar-icon-default',
                  'text-btn-ico-side-bar-tool-default',
                  {
                    'hover:bg-btn-bg-side-bar-icon-hover hover:text-btn-ico-side-bar-tool-hover': !action.disabled,
                    'bg-btn-bg-side-bar-tool-disabled text-btn-ico-tool-disabled': action.disabled,
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
