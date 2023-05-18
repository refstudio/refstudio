import { useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { invoke } from '@tauri-apps/api/tauri';
import { Command } from '@tauri-apps/api/shell';


function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const command = Command.sidecar("bin/python/main");
    const output = await command.execute();
    setGreetMsg(await invoke('greet', { name: name, sender: output.stdout }));
  }

  return (
    <PanelGroup autoSaveId="example" direction="horizontal">
      <Panel />
      <Panel>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
          >
            <input
              id="greet-input"
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <button type="submit">Greet</button>
          </form>
          <p>{greetMsg}</p>
        </div>
      </Panel>
      <Panel />
    </PanelGroup>
  );
}

export default App;
