import { useState } from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

import { cx } from '../lib/cx';

export function VerticalResizeHandle() {
  const [isDragging, setDragging] = useState(false);

  return (
    <PanelResizeHandle
      className={cx('flex h-full w-1', 'bg-resizer-bg-default hover:bg-resizer-bg-hover', {
        'bg-resizer-bg-hover': isDragging,
      })}
      onDragging={setDragging}
    />
  );
}
