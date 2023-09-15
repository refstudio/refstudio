import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { S2SearchResult } from '../../api/api-types';
import { AddIcon } from '../../application/components/icons';
import { getSearchResultsAtom, loadSearchResultsAtom } from '../../atoms/s2SearchState';
import { Button } from '../../components/Button';
import { DotIcon, SearchIcon, SmallInfoIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { cx } from '../../lib/cx';

const SearchBar = ({ onChange }: { onChange: (value: string, limit: number) => void }) => (
  <div className="sticky top-0 flex items-center border-b border-slate-200 bg-modal-bg-primary p-4">
    <div className="pr-3 text-input-ico-placeholder">
      <SearchIcon />
    </div>
    <input
      className="grow fill-none text-[1.375rem]/8 text-input-txt-primary outline-none"
      name="semantic-scholar-search"
      placeholder="Search Semantic Schola..."
      type="text"
      onChange={(e) => onChange(e.target.value, 20)}
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

const SearchResult = ({ reference }: { reference: S2SearchResult }) => (
  <div className="border-b border-slate-200 px-5 py-3 text-[.875rem]">
    <div className="space-y-2">
      <div className="flex">
        <div
          className={cx({ 'opacity-30': !reference.openAccessPdf }, 'basis-4/5 truncate font-semibold')}
          title={reference.title}
        >
          {reference.title}
        </div>
        {reference.openAccessPdf && (
          <div className="flex basis-1/5 justify-end">
            <Button Action={<AddIcon />} size="S" text="Add" type="secondary" />
          </div>
        )}
        {!reference.openAccessPdf && (
          <div className="flex basis-1/5 justify-end">
            <div title="Ref Studio can only supplort references with a PDF">PDF Not Available</div>
            <div className=" cursor-pointer" title="Ref Studio can only supplort references with a PDF">
              <SmallInfoIcon />
            </div>
          </div>
        )}
      </div>
      {reference.openAccessPdf && (
        <>
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
        </>
      )}
    </div>
  </div>
);

export function S2SearchModal({ open, onClose: onClose }: { open: boolean; onClose: () => void }) {
  const searchResultsList: S2SearchResult[] = useAtomValue(getSearchResultsAtom);

  const loadSearchResults = useSetAtom(loadSearchResultsAtom);

  const handleKeyWordsEntered = useCallback(
    (searchTerm: string, limit?: number) => {
      void loadSearchResults(searchTerm, limit);
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
