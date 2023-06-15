import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useDebounce } from 'usehooks-ts';

import { askForRewrite } from '../../api/rewrite';
import { selectionAtom } from '../../atoms/selectionState';
import { PanelSection } from '../../components/PanelSection';

export function SelectionPanelSection() {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, 200);

  const {
    error,
    data: rewrite,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [], // keep the old summary if the user selects new text
    enabled: false,
    queryFn: () => askForRewrite(debouncedSelection),
  });
  const fetchRewrite = () => {
    console.log('fetching rewrite');
    void refetch(); // promise rejection is handled via "error" variable
  };
  console.log(isFetching, rewrite);

  return (
    <PanelSection title="Selection">
      <p className="my-4 italic">Select some text in the editor to see it here.</p>

      {(selection || rewrite) && (
        <div className="mb-6 flex flex-col gap-4">
          <div className="border border-slate-100 bg-slate-50 p-4">{debouncedSelection}</div>
          <button className="btn-primary" disabled={isFetching || !selection} onClick={fetchRewrite}>
            REWRITE
          </button>
          {error ? <span className="bg-red-50">{String(error)}</span> : null}
          {isFetching && <span>Processing...</span>}
          {rewrite && (
            <>
              <div className="border border-green-100 bg-green-50 p-4">{rewrite}</div>
              {/* <button className="rounded-xl bg-green-100 hover:bg-green-200" onClick={handleReplaceClicked}>
                          REPLACE
                        </button> */}
            </>
          )}
        </div>
      )}
    </PanelSection>
  );
}
