import { callSidecar } from './sidecar';

export async function completeSentence(text: string): Promise<string[]> {
  try {
    if (text.trim() === '') {
      return [];
    }

    const response = await callSidecar('completion', { text, n_choices: 3 });
    return response.map((suggestion) => suggestion.text);
  } catch (err) {
    console.error('Rewrite error', err);
    return [];
  }
}
