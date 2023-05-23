import { Command } from '@tauri-apps/api/shell';
import { useEffect, useState } from 'react';

export function AIView({ selection }: { selection: string | null }) {
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (selection) {
      async function interactWithAi() {
        try {
          const command = Command.sidecar(
            'bin/python/main', ["ai", "--text", `${selection}`]
          );
          console.log(command);
          const output = await command.execute();
          console.log(output);
          const response = JSON.parse(output.stdout);
          const aiReply = response.num_words;

          setReply(aiReply);
        } catch (reason) {
          setReply('ERROR: ' + reason);
        }
      }
      interactWithAi().catch(console.error);
    }
  }, [selection]);

  return (
    <div>
      <h1>AI Interactions</h1>
      <p className="my-4 italic">
        Select some text in the editor to see it here.
      </p>

      {selection && (
        <div className="flex flex-col gap-4">
          <div className="border border-yellow-100 bg-yellow-50 p-4">
            {selection}
          </div>
          <strong>REPLY</strong>
          <div className="border border-green-100 bg-green-50 p-4">{reply}</div>
        </div>
      )}
    </div>
  );
}
