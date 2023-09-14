import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { S2SearchResult } from '../../api/api-types';
import { getSearchResultsAtom, loadSearchResultsAtom } from '../../atoms/s2SearchState';
import { DotIcon, SearchIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

const SearchBar = ({ onChange }: { onChange: (value: string) => void }) => (
  <div className="sticky top-0 flex items-center border-b border-slate-200 bg-modal-bg-primary p-4">
    <div className="pr-3 text-input-ico-placeholder">
      <SearchIcon />
    </div>
    <input
      className="grow fill-none text-[1.375rem]/8 text-input-txt-primary outline-none"
      name="semantic-scholar-search"
      placeholder="Search Semantic Schola..."
      type="text"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SearchResultsList = ({ searchResultsList }: { searchResultsList: S2SearchResult[] }) => (
  <div className="text-modal-txt-primary">
    {searchResultsList.map((reference) => (
      <SearchResult key={reference.paperId} reference={reference} />
    ))}
  </div>
);

const dot = () => <span className="h-[1.5rem] text-clip text-[2rem]"> &bull; </span>;

const SearchResult = ({ reference }: { reference: S2SearchResult }) => (
  <div className="border-b border-slate-200 px-5 py-3 text-[.875rem]">
    <div className="font-semibold">{reference.title}</div>
    <div className="flex">
      <div className="truncate" title={'Authors: ' + reference.authors.join(', ')}>
        {reference.authors.join(', ')}
      </div>
      <div>{reference.authors.length > 0 ? DotIcon() : ''}</div>
      <div className="truncate" title={reference.venue}>
        {reference.venue}
      </div>
      <div>{reference.venue ? DotIcon() : ''}</div>
      <div> {reference.year}</div>
    </div>
    <div className="line-clamp-4">{reference.abstract}</div>
  </div>
);

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
      <div className="h-[37.5rem] w-[50rem] cursor-default select-none gap-2 overflow-auto bg-modal-bg-primary ">
        <SearchBar onChange={debouncedOnChange} />
        <SearchResultsList searchResultsList={searchResultsList} />
      </div>
    </Modal>
  );
}
