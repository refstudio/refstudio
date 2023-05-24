import { Command } from '@tauri-apps/api/shell';
import { useEffect, useState } from 'react';

import { useAppSelector } from '../redux/hooks';

export function AIView() {
  const selection = useAppSelector((state) => state.selection.text);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (!selection) return;
    interactWithAi(selection).then(setReply).catch(console.error);
  }, [selection]);

  return (
    <div>
      <h1>AI Interactions</h1>
      <p className="my-4 italic">Select some text in the editor to see it here.</p>

      {selection && (
        <div className="flex flex-col gap-4">
          <div className="border border-yellow-100 bg-yellow-50 p-4">{selection}</div>
          <strong>REPLY</strong>
          <div className="border border-green-100 bg-green-50 p-4">{reply}</div>
        </div>
      )}
    </div>
  );
}

async function interactWithAi(selection: string) {
  try {
    const command = Command.sidecar('bin/python/main', ['--text', `${selection}`]);
    const output = await command.execute();
    if (output.stderr) throw new Error(output.stderr);

    const response = JSON.parse(output.stdout);
    const aiReply = response.num_words;
    return aiReply;
  } catch (reason) {
    throw new Error('ERROR: ' + reason);
  }
}
