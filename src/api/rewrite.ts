import { notifyError } from '../notifications/notifications';
import { callSidecar } from './sidecar';

export async function askForRewrite(selection: string): Promise<string> {
  try {
    if (selection.trim() === '') {
      return '';
    }

    const response = await callSidecar('rewrite', { text: selection });

    if (response.status === 'error') {
      notifyError('Rewrite error', response.message);
      return '';
    }

    return response.choices[0].text;
  } catch (err) {
    return `Rewrite error: ${String(err)}`;
  }
}
