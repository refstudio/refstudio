import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useState } from 'react';

import { S2SearchResult } from '../../api/api-types';
import { AddIcon } from '../../application/components/icons';
import { projectIdAtom } from '../../atoms/projectState';
import {
  addS2ReferenceAtom,
  clearSearchResultsAtom,
  getSearchResultsAtom,
  loadSearchResultsAtom,
  removeS2ReferenceAtom,
} from '../../atoms/s2SearchState';
import { Button } from '../../components/Button';
import { CheckIcon, DotIcon, MinusIcon, NoPdfIcon, SearchIcon, SmallInfoIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { cx } from '../../lib/cx';
import { LoadingIcon } from '../components/icons';

const SearchBar = ({ onChange }: { onChange: (value: string, limit: number) => void }) => (
  <div className="sticky top-0 flex border-b border-slate-200 bg-modal-bg-primary p-4">
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
  const [refStatus, setRefStatus] = useState('ready');
  const [refId, setRefId] = useState('');

  const [showRemove, setShowRemove] = useState(false);
  const saveS2Reference = useSetAtom(addS2ReferenceAtom);
  const removeS2Reference = useSetAtom(removeS2ReferenceAtom);

  const addClickHandler = useCallback(() => {
    setRefStatus('adding');
    saveS2Reference(projectId, reference)
      .then((result) => {
        console.log(result);
        setRefId(result.references[0].id);
        setRefStatus('added');
      })
      .catch((e) => {
        console.log(e);
        setRefStatus('error');
      });
  }, [projectId, reference, saveS2Reference]);

  const removeClickHandler = useCallback(() => {
    removeS2Reference(projectId, refId)
      .then(() => {
        setRefStatus('ready');
      })
      .catch(() => {
        setRefStatus('remove-error');
      });
  }, [projectId, refId, removeS2Reference]);

  return (
    <div className="border-b border-slate-200 px-5 py-3 text-[.875rem]">
      <div className="space-y-2">
        <div className="flex">
          <div className="basis-4/5 truncate font-semibold" title={reference.title}>
            {reference.title}
          </div>
          <div className="flex basis-1/5 justify-end space-x-1">
            {refStatus === 'ready' && (
              <>
                {!reference.openAccessPdf && (
                  <div
                    className="flex items-center justify-center"
                    title="This reference has no PDF. Chat functions will be limited"
                  >
                    <NoPdfIcon />
                  </div>
                )}
                <AddButton addClickHandler={addClickHandler} />
              </>
            )}
            {refStatus === 'added' && (
              <RemoveButton
                removeClickHandler={removeClickHandler}
                setShowRemove={setShowRemove}
                showRemove={showRemove}
              />
            )}
            {refStatus === 'error' && <CouldNotAddRef />}
            {refStatus === 'remove-error' && <CouldNotRemoveRef />}
            {refStatus === 'adding' && (
              <div className="flex py-[.375rem]">
                Adding <LoadingIcon />
              </div>
            )}
          </div>
        </div>
        <MetaData reference={reference} />
      </div>
    </div>
  );
};

const formatPublicationDate = (publicationDate: string) => {
  const date = new Date(publicationDate);
  return (
    date.getDate().toString() +
    ' ' +
    date.toLocaleString('default', { month: 'short' }) +
    ' ' +
    date.getFullYear().toString()
  );
};

const MetaData = ({ reference }: { reference: S2SearchResult }) => {
  const authors = reference.authors ? reference.authors.join(', ') : '';
  return (
    <>
      <div className="flex">
        <div className="truncate" title={'Authors: ' + authors}>
          {authors}
        </div>
        <div>{authors ? DotIcon() : ''}</div>
        <div className="truncate" title={reference.venue}>
          {reference.venue}
        </div>
        <div>{reference.venue ? DotIcon() : ''}</div>
        <div> {reference.publicationDate ? formatPublicationDate(reference.publicationDate) : reference.year}</div>
      </div>
      <div className="line-clamp-4">{reference.abstract}</div>
    </>
  );
};

const CouldNotAddRef = () => (
  <>
    <div className="py-[.375rem] text-red-400" title="Sorry, something went wrong when adding this reference.">
      Upload Error
    </div>
    <div
      className=" cursor-pointer py-[.375rem] text-red-400"
      title="Sorry, something went wrong when adding this reference."
    >
      <SmallInfoIcon />
    </div>
  </>
);

const CouldNotRemoveRef = () => (
  <>
    <div className="py-[.375rem] text-red-400" title="Sorry, something went wrong when removing this reference.">
      Remove Error
    </div>
    <div
      className=" cursor-pointer py-[.375rem] text-red-400"
      title="Sorry, something went wrong when removing this reference."
    >
      <SmallInfoIcon />
    </div>
  </>
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
      inheritColor={true}
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

  const [loading, setLoading] = useState(false);

  const handleKeyWordsEntered = useCallback(
    (searchTerm: string, limit?: number) => {
      setLoading(true);
      loadSearchResults(searchTerm, limit)
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          console.log('error');
        });
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
      <div className="flex h-[37.5rem] w-[50rem] cursor-default select-none flex-col bg-modal-bg-primary">
        <SearchBar onChange={debouncedOnChange} />
        <div className="grow gap-2 overflow-auto text-modal-txt-primary">
          {!loading && !searchResultsList.length && (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="text-xl/6 font-semibold text-side-bar-txt-primary">
                Add references from Semantic Scholar
              </div>
              <div className="text-side-bar-txt-secondary">
                Enter keywords above to search Semantic Scholar for references to add to your library.
              </div>
            </div>
          )}
          {loading && (
            <div className="flex h-full items-center justify-center">
              <LoadingIcon />
            </div>
          )}
          {!loading &&
            searchResultsList.map((reference) => (
              <SearchResult key={reference.paperId} projectId={projectId} reference={reference} />
            ))}
        </div>
      </div>
    </Modal>
  );
}
