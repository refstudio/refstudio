import { useAtomValue } from 'jotai';
import { useDebounce } from 'usehooks-ts';

import { callSidecar } from '../api/sidecar';
import { selectionAtom } from '../atoms/selectionState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { useCallablePromise } from '../hooks/useCallablePromise';

export function AIPanel({ onCloseClick }: { onCloseClick?: () => void }) {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, 200);

  const [rewriteCallState, callRewrite] = useCallablePromise(askForRewrite);

  return (
    <PanelWrapper closable title="AI" onCloseClick={onCloseClick}>
      <PanelSection title="Selection">
        <p className="my-4 italic">Select some text in the editor to see it here.</p>

        {selection && (
          <div className="flex flex-col gap-4">
            <div className="border border-yellow-100 bg-yellow-50 p-4">{debouncedSelection}</div>
            <button
              className="btn cursor-pointer rounded-xl bg-yellow-100 hover:bg-yellow-200"
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
                {/* <button className="btn rounded-xl bg-green-100 hover:bg-green-200" onClick={handleReplaceClicked}>
                  REPLACE
                </button> */}
              </>
            )}
          </div>
        )}
      </PanelSection>
    </PanelWrapper>
  );
}

async function askForRewrite(selection: string) {
  try {
    const response = await callSidecar('rewrite', ['--text', selection]);
    const aiReply = response[0].text;
    return aiReply;
  } catch (reason) {
    throw new Error(`ERROR: ${reason}`);
  }
}
