import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';

export function AIView({ selection }: { selection: string }) {
  const [reply, setReply] = useState('');

  useEffect(() => {
    invoke<string>('interact_with_ai', { selection })
      .then(setReply)
      .catch((reason) => setReply('ERROR: ' + reason));
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
