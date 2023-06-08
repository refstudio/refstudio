import './ReferencesList.css';

import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { useAtomValue } from 'jotai';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

import { getReferencesAtom, getReferencesFuseAtom } from '../../atoms/referencesState';
import { cx } from '../../cx';
import { ReferenceItem } from '../../types/ReferenceItem';

export type ReferenceListProps = SuggestionProps<{ id: string; label: string }>;

export const ReferencesList = forwardRef((props: ReferenceListProps, ref) => {
  const { command, clientRect, query } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const references = useAtomValue(getReferencesAtom);
  const referenceFuses = useAtomValue(getReferencesFuseAtom);

  const queriedReferences = useMemo(
    () =>
      query.length > 0
        ? referenceFuses
            .search(query)
            .slice(0, 5)
            .map(({ item }) => item)
        : references,
    [referenceFuses, references, query],
  );
  const referenceElement = useMemo(
    () => (clientRect ? { getBoundingClientRect: () => clientRect()! } : null),
    [clientRect],
  );

  const handleSelect = (index: number) => {
    const referenceItem = queriedReferences[index];

    command({ id: referenceItem.id, label: getReferenceLabel(referenceItem) });
  };

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((currentIndex) => (currentIndex + queriedReferences.length - 1) % queriedReferences.length);
  }, [queriedReferences.length]);

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % queriedReferences.length);
  }, [queriedReferences.length]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [queriedReferences]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        handleArrowUp();
        return true;
      }

      if (event.key === 'ArrowDown') {
        handleArrowDown();
        return true;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        handleSelect(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
  });

  return createPortal(
    <div className="items" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
      {queriedReferences.length ? (
        queriedReferences.map(({ id, title }, index) => (
          <button
            className={cx('item', { selected: index === selectedIndex })}
            key={id}
            onClick={() => handleSelect(index)}
          >
            {title}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>,
    document.body,
  );
});

ReferencesList.displayName = 'ReferencesList';

export function getReferenceLabel(referenceItem: ReferenceItem): string {
  return `[${referenceItem.authors.map(({ surname }) => surname).join(';')}]`;
}
