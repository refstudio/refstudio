import { useState } from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

import { cx } from '../lib/cx';

export function VerticalResizeHandle() {
  const [isDragging, setDragging] = useState(false);

  return (
    <PanelResizeHandle
      className={cx('flex h-full w-1', 'bg-grayscale-20 hover:bg-grayscale-40', { 'bg-grayscale-40': isDragging })}
      onDragging={setDragging}
    />
  );
}
