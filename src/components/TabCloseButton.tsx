import { useState } from 'react';
import { VscCircleFilled, VscClose } from 'react-icons/vsc';

interface CloseButtonProps {
  isDirty?: boolean;
  onClick: () => void;
}

function CloseIcon({ onClick }: Pick<CloseButtonProps, 'onClick'>) {
  return <VscClose
    className="invisible group-hover:visible"
    role="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  />;
}

/**
 * The close button is a black circle when the file is dirty (ie. has unsaved changes)
 * but transform into the close icon when hovered
 * When the file is not dirty, there is an invisble close icon, that appears when the tab is hovered
 */
export function TabCloseButton({ isDirty, onClick }: CloseButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isDirty ?
        (isHovered ?
          <CloseIcon onClick={onClick} /> :
          <VscCircleFilled />)
        : <CloseIcon onClick={onClick} />}
    </div>
  );
}