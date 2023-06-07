import { Command } from '@tauri-apps/api/shell';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

import { selectionAtom } from '../atoms/selectionState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';

export function AIPanel({ onCloseClick }: { onCloseClick?: () => void }) {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, 200);

  const [rewriteReply, setRewriteReply] = useState('');
  const [loadingRewrite, setLoadingRewrite] = useState(false);

  useEffect(() => {
    setRewriteReply('');
  }, [debouncedSelection]);

  function handleRewriteClick() {
    (async function run() {
      try {
        setLoadingRewrite(true);
        const reply = await askForRewrite(selection);
        setRewriteReply(reply);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRewrite(false);
      }
    })();
  }

  return (
    <PanelWrapper closable title="AI" onCloseClick={onCloseClick}>
      <PanelSection title="Selection">
        <p className="my-4 italic">Select some text in the editor to see it here.</p>

        {selection && (
          <div className="flex flex-col gap-4">
            <div className="border border-yellow-100 bg-yellow-50 p-4">{debouncedSelection}</div>
            <button
              className="btn rounded-xl bg-yellow-100 hover:bg-yellow-200"
              disabled={loadingRewrite}
              onClick={handleRewriteClick}
            >
              REWRITE
            </button>
            {loadingRewrite && <span>Processing...</span>}
            {rewriteReply && (
              <>
                <div className="border border-green-100 bg-green-50 p-4">{rewriteReply}</div>
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
    const command = new Command('call-sidecar', ['rewrite', '--text', `${selection}`]);
    console.log('command', command);
    const output = await command.execute();
    if (output.stderr) {
      throw new Error(output.stderr);
    }
    console.log('output: ', output.stdout);
    const response = JSON.parse(output.stdout) as { index: number; text: string }[];
    const aiReply = response[0].text;
    return aiReply;
  } catch (reason) {
    throw new Error(`ERROR: ${reason}`);
  }
}
