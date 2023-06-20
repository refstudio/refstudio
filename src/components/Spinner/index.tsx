import './index.css';

import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

export function Spinner() {
  return <div className="lds-dual-ring" />;
}

export function ProgressSpinner({ badge }: { badge: string }) {
  const STEP = 1;
  const [percent, setValue] = useState(0);

  useInterval(() => {
    setValue(Math.min(percent + STEP, 100));
  }, 200);

  return (
    <div className="relative pt-1">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="inline-block rounded-full bg-green-200 px-2 py-1 text-xs font-semibold uppercase text-green-600">
            {badge}
          </span>
        </div>
        <div className="text-right">
          <span className="inline-block text-xs font-semibold text-green-600">{percent}%</span>
        </div>
      </div>
      <div className="mb-4 flex h-2 overflow-hidden rounded bg-green-200 text-xs">
        <div
          className="flex flex-col justify-center whitespace-nowrap bg-green-500 text-center text-white shadow-none transition-all duration-200 ease-in"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
