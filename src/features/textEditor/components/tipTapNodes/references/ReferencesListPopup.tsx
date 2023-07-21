import './ReferencesListPopup.css';

import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import Fuse from 'fuse.js';
import { useAtomValue } from 'jotai';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

import { getReferencesAtom } from '../../../../../atoms/referencesState';
import { cx } from '../../../../../lib/cx';
import { fuseOptions } from './config';

export type ReferenceListPopupProps = SuggestionProps<{ id: string }>;

export const ReferencesListPopup = forwardRef((props: ReferenceListPopupProps, ref) => {
  const { command, clientRect, query } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const references = useAtomValue(getReferencesAtom);

  const referencesFuse = useMemo(() => new Fuse(references, fuseOptions), [references]);

  const queriedReferences = useMemo(() => {
    if (query.length > 0) {
      return referencesFuse
        .search(query)
        .slice(0, 5)
        .map(({ item }) => item);
    } else {
      // Fallback to references list because fuse.search with an empty query returns an empty list,
      // which is not the expected behaviour for the selector
      return references;
    }
  }, [referencesFuse, references, query]);

  const referenceElement = useMemo(() => {
    if (clientRect) {
      return { getBoundingClientRect: () => clientRect()! };
    } else {
      return null;
    }
  }, [clientRect]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [queriedReferences]);

  /* c8 ignore start */
  const handleSelect = (index: number) => {
    const referenceItem = queriedReferences[index];

    command({ id: referenceItem.id });
  };

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((currentIndex) => (currentIndex + queriedReferences.length - 1) % queriedReferences.length);
  }, [queriedReferences.length]);

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % queriedReferences.length);
  }, [queriedReferences.length]);

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
  /* c8 ignore stop */

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
  });

  return createPortal(
    <div
      className="references"
      data-testid={ReferencesListPopup.displayName}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {queriedReferences.length ? (
        queriedReferences.map(({ id, title }, index) => (
          <button
            className={cx('reference', { selected: index === selectedIndex })}
            key={id}
            role="button"
            onClick={() => handleSelect(index)}
          >
            {title}
          </button>
        ))
      ) : (
        <div className="reference">No result</div>
      )}
    </div>,
    document.body,
  );
});

ReferencesListPopup.displayName = 'ReferencesList';
