import { useState } from 'react';

import { useListenEvent } from '../../hooks/useListenEvent';
import { S2SearchModal } from './S2SearchModal';

export function S2SearchModalOpener() {
  const [open, setOpen] = useState(false);

  useListenEvent('refstudio://menu/references/search', () => setOpen((curr) => !curr));

  if (!open) {
    return null;
  }

  return <S2SearchModal open={open} onClose={() => setOpen(false)} />;
}