import { useAtomValue } from 'jotai';
import { useDebounce } from 'usehooks-ts';

import { askForRewrite } from '../../api/rewrite';
import { selectionAtom } from '../../atoms/selectionState';
import { PanelSection } from '../../components/PanelSection';
import { useCallablePromise } from '../../hooks/useCallablePromise';

export function SelectionPanelSection() {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, 200);

  const [rewriteCallState, callRewrite] = useCallablePromise(askForRewrite);

  return (
    <PanelSection title="Selection">
      <p className="my-4 italic">Select some text in the editor to see it here.</p>

      {selection && (
        <div className="mb-6 flex flex-col gap-4">
          <div className="border border-slate-100 bg-slate-50 p-4">{debouncedSelection}</div>
          <button
            className="btn-primary"
            disabled={rewriteCallState.state === 'loading'}
            onClick={() => callRewrite(debouncedSelection)}
          >
            REWRITE
          </button>
          {rewriteCallState.state === 'error' && <span className="bg-red-50">{String(rewriteCallState.error)}</span>}
          {rewriteCallState.state === 'loading' && <span>Processing...</span>}
          {rewriteCallState.state === 'ok' && (
            <>
              <div className="border border-green-100 bg-green-50 p-4">{rewriteCallState.data}</div>
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
