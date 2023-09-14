import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { S2SearchResult } from '../../api/api-types';
import { getSearchResultsAtom, loadSearchResultsAtom } from '../../atoms/s2SearchState';
import { SearchIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

export function S2SearchModal({ open, onClose: onClose }: { open: boolean; onClose: () => void }) {
  const searchResultsList: S2SearchResult[] = useAtomValue(getSearchResultsAtom);

  const loadSearchResults = useSetAtom(loadSearchResultsAtom);

  const handleKeyWordsEntered = useCallback(
    (searchTerm: string) => {
      void loadSearchResults(searchTerm);
    },
    [loadSearchResults],
  );

  const debouncedOnChange = useDebouncedCallback(handleKeyWordsEntered, 400);

  return (
    <Modal className="h-[37.5rem] w-[50rem]" open={open} onClose={onClose}>
      <div className="h-[37.5rem] w-[50rem] cursor-default select-none gap-2 bg-modal-bg-primary">
        <div className="flex items-center p-4">
          <div className="pr-3 text-input-ico-placeholder">
            <SearchIcon />
          </div>
          <input
            className="grow fill-none text-[1.375rem]/8 text-input-txt-primary outline-none"
            name="semantic-scholar-search"
            placeholder="Search Semantic Scholar"
            type="text"
            onChange={(e) => debouncedOnChange(e.target.value)}
          />
        </div>
        <div>
          {searchResultsList.map((item) => (
            <div className="border-b border-slate-200 px-5 py-3" key={item.paperId}>
              {item.title}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
