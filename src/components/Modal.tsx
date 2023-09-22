import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { useRefStudioHotkeys } from '../hooks/useRefStudioHotkeys';
import { cx } from '../lib/cx';

interface ModalProps {
  children: React.ReactElement | React.ReactElement[];
  className?: string;
  open: boolean;
  onClose: () => void;
}
export function Modal({ children, className, open, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useRefStudioHotkeys(['escape'], () => {
    if (open) {
      onClose();
    }
  });
  useOnClickOutside(modalRef, onClose);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cx(
        'cursor-default',
        'fixed left-0 top-0 z-modals flex h-screen w-screen items-center justify-center',
        'bg-modal-bg-overlay bg-opacity-overlay',
      )}
    >
      <div
        className={cx('flex items-stretch overflow-hidden', 'rounded-modal shadow-default', className)}
        ref={modalRef}
      >
        {children}
      </div>
    </div>
  );
}
