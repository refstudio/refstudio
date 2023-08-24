import { cx } from '../lib/cx';
import { CircleIcon, CloseIcon } from './icons';

interface CloseButtonProps {
  className?: string;
  isDirty?: boolean;
  onClick: () => void;
}

/**
 * The close button is a black circle when the file is dirty (ie. has unsaved changes)
 * but transform into the close icon when hovered
 * When the file is not dirty, there is an invisble close icon, that appears when the tab is hovered
 */
export function TabCloseButton({ isDirty, onClick }: CloseButtonProps) {
  return (
    <div
      className={cx(
        'invisible group-hover:visible', // invisible unless the tab is hovered
        'group/tab-close-button',
        {
          '!visible': isDirty,
        },
      )}
    >
      <div
        className={cx('block', 'group-hover/tab-close-button:!block', 'hover:text-btn-ico-top-bar-active', {
          '!hidden': isDirty,
        })}
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <CloseIcon />
      </div>
      <div
        className={cx('hidden', 'group-hover/tab-close-button:!hidden', {
          '!block': isDirty,
        })}
      >
        <CircleIcon />
      </div>
    </div>
  );
}
