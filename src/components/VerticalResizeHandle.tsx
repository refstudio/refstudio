import { useState } from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

import { cx } from '../lib/cx';

export function VerticalResizeHandle({ transparent }: { transparent?: boolean }) {
  const [isDragging, setDragging] = useState(false);

  return (
    <div className="relative">
      <PanelResizeHandle
        className={cx(
          'flex h-full w-1',
          'bg-resizer-bg-default hover:bg-resizer-bg-hover',
          'absolute -ml-0.5 z-resize-handle',
          {
            'bg-resizer-bg-hover': isDragging,
            'bg-transparent': transparent && !isDragging,
          },
        )}
        onDragging={setDragging}
      />
    </div>
  );
}
