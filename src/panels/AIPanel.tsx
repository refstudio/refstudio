import { Command } from '@tauri-apps/api/shell';
import { useEffect, useState } from 'react';

import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';

export function AIPanel({ selection }: { selection: string | null }) {
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (!selection) {
      return;
    }
    interactWithAi(selection)
      .then((num) => setReply(String(num)))
      .catch(console.error);
  }, [selection]);

  return (
    <PanelWrapper title="AI">
      <PanelSection title="Selection">
        <p className="my-4 italic">Select some text in the editor to see it here.</p>

        {selection && (
          <div className="flex flex-col gap-4">
            <div className="border border-yellow-100 bg-yellow-50 p-4">{selection}</div>
            <strong>REPLY</strong>
            <div className="border border-green-100 bg-green-50 p-4">{reply}</div>
          </div>
        )}
      </PanelSection>
    </PanelWrapper>
  );
}

interface AIResponse {
  num_words: number;
}

async function interactWithAi(selection: string) {
  try {
    const command = Command.sidecar('bin/python/main', ['ai', '--text', `${selection}`]);
    const output = await command.execute();
    if (output.stderr) {
      throw new Error(output.stderr);
    }

    const response = JSON.parse(output.stdout) as AIResponse;
    const aiReply = response.num_words;
    return aiReply;
  } catch (reason) {
    throw new Error(`ERROR: ${reason}`);
  }
}
