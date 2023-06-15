import { callSidecar } from './sidecar';

export async function chatWithAI(text: string): Promise<string[]> {
  try {
    if (!text) {
      return [];
    }
    const response = await callSidecar('chat', ['--text', String(text)]);
    return response.map((choice) => choice.text);
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}
