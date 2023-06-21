import { callSidecar } from './sidecar';

export async function askForRewrite(selection: string): Promise<string> {
  try {
    if (selection.trim() === '') {
      return '';
    }

    const response = await callSidecar('rewrite', ['--text', String(selection)]);
    return response[0].text;
  } catch (err) {
    return `Rewrite error: ${String(err)}`;
  }
}
