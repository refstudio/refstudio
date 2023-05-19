import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';

export function AIView({ selection }: { selection: string | null }) {
    const [reply, setReply] = useState('');

    useEffect(() => {
        if (selection) {
            async function interactWithAi() {
                try {
                    const aiReply = await invoke<string>('interact_with_ai', { selection });
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
            <p style={{
                marginTop: "1rem",
                marginBottom: "1rem",
                fontStyle: 'italic'
            }}>
                Select some text in the editor to see it here.
            </p>

            {selection && (
                <div style={{ display: 'flex', flexDirection: "column", gap: "1rem" }}>
                    <div style={{ borderWidth: "1px", borderColor: "rgb(254 249 195)", backgroundColor: "rgb(254 252 232)", padding: "1rem" }}>
                        {selection}
                    </div>
                    <strong>REPLY</strong>
                    <div style={{ borderWidth: "1px", borderColor: 'rgb(220 252 231)', backgroundColor: "rgb(240 253 244)", padding: "1rem" }}>{reply}</div>
                </div>
            )}
        </div>
    );
}