import { notifyError } from '../notifications/notifications';
import { callSidecar } from './sidecar';

export async function chatWithAI(text: string): Promise<string[]> {
  try {
    if (!text) {
      return [];
    }
    const response = await callSidecar('chat', { text });

    if (response.status === 'error') {
      notifyError('Chat error', response.message);
    }

    return response.choices.map((choice) => choice.text);
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}
