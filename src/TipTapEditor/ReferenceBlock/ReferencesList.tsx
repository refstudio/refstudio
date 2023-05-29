import './ReferencesList.css';

import { SuggestionKeyDownProps } from '@tiptap/suggestion';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { ReferenceItem } from '../../types/ReferenceItem';

export interface ReferencesListProps {
  items: ReferenceItem[];
  command: (referenceItem: ReferenceItem) => void;
}

export const ReferencesList = forwardRef(({ items, command }: ReferencesListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index] as ReferenceItem | undefined;

    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="items">
      {items.length ? (
        items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.id}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});

ReferencesList.displayName = 'ReferencesList';
