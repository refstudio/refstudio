import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useState } from 'react';

import { S2SearchResult } from '../../api/api-types';
import { AddIcon } from '../../application/components/icons';
import { projectIdAtom } from '../../atoms/projectState';
import { clearSearchResultsAtom, getSearchResultsAtom, loadSearchResultsAtom } from '../../atoms/s2SearchState';
import { Button } from '../../components/Button';
import { CheckIcon, DotIcon, MinusIcon, SearchIcon, SmallInfoIcon } from '../../components/icons';
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
      placeholder="Search Semantic Scholar..."
      type="text"
      onChange={(e) => onChange(e.target.value, 20)}
    />
  </div>
);

const SearchResult = ({ reference, projectId }: { reference: S2SearchResult; projectId: string }) => {
  const [added, setAdded] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  // const addSearchResults = useSetAtom(addS2ReferenceAtom);

  const addClickHandler = useCallback(() => {
    setAdded(true);
  }, []);

  const removeClickHandler = useCallback(() => {
    setAdded(false);
  }, []);

  return (
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
              {!added && <AddButton addClickHandler={addClickHandler} />}
              {added && (
                <RemoveButton
                  removeClickHandler={removeClickHandler}
                  setShowRemove={setShowRemove}
                  showRemove={showRemove}
                />
              )}
            </div>
          )}
          {!reference.openAccessPdf && <NoPDF />}
        </div>
        {reference.openAccessPdf && <MetaData reference={reference} />}
      </div>
    </div>
  );
};

const MetaData = ({ reference }: { reference: S2SearchResult }) => (
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
);

const NoPDF = () => (
  <div className="flex basis-1/5 justify-end">
    <div title="Ref Studio can only supplort references with a PDF">PDF Not Available</div>
    <div className=" cursor-pointer" title="Ref Studio can only supplort references with a PDF">
      <SmallInfoIcon />
    </div>
  </div>
);

const AddButton = ({ addClickHandler }: { addClickHandler: () => void }) => (
  <Button
    Action={<AddIcon />}
    size="S"
    text="Add"
    title="Add this reference to your references list"
    type="secondary"
    onClick={(e) => {
      e.stopPropagation();
      addClickHandler();
    }}
  />
);

const RemoveButton = ({
  showRemove,
  setShowRemove,
  removeClickHandler,
}: {
  showRemove: boolean;
  setShowRemove: (value: boolean) => void;
  removeClickHandler: () => void;
}) => (
  <div
    onMouseLeave={() => {
      setShowRemove(false);
    }}
    onMouseOver={() => {
      setShowRemove(true);
    }}
  >
    <Button
      Action={showRemove ? <MinusIcon /> : <CheckIcon />}
      className={cx('bg-transparent text-[#61C554]', 'hover:bg-red-400 hover:text-white')}
      size="S"
      text={showRemove ? 'Remove' : 'Added'}
      title="Remove this reference from your reference list"
      type="secondary"
      onClick={(e) => {
        e.stopPropagation();
        removeClickHandler();
      }}
    />
  </div>
);

export function S2SearchModal({ open, onClose: onClose }: { open: boolean; onClose: () => void }) {
  const searchResultsList: S2SearchResult[] = useAtomValue(getSearchResultsAtom);
  const projectId = useAtomValue(projectIdAtom);

  const loadSearchResults = useSetAtom(loadSearchResultsAtom);
  const clearSearchResults = useSetAtom(clearSearchResultsAtom);

  const handleKeyWordsEntered = useCallback(
    (searchTerm: string, limit?: number) => {
      void loadSearchResults(searchTerm, limit);
    },
    [loadSearchResults],
  );

  const debouncedOnChange = useDebouncedCallback(handleKeyWordsEntered, 400);

  const onCloseHandler = () => {
    clearSearchResults();
    onClose();
  };

  return (
    <Modal className="h-[37.5rem] w-[50rem]" open={open} onClose={onCloseHandler}>
      <div className="h-[37.5rem] w-[50rem] cursor-default select-none gap-2 overflow-auto bg-modal-bg-primary ">
        <SearchBar onChange={debouncedOnChange} />
        <div className="text-modal-txt-primary">
          {searchResultsList.map((reference) => (
            <SearchResult key={reference.paperId} projectId={projectId} reference={reference} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
