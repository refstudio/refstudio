import { notifyError } from '../notifications/notifications';
import { callSidecar } from './sidecar';
import { ChatResponse } from './types';

export async function chatWithAI(projectId: string, text: string): Promise<string[]> {
  try {
    if (!text) {
      return [];
    }

    if (import.meta.env.VITE_IS_WEB) {
      const response = await fetch(`/api/ai/${projectId}/chat`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const res = (await response.json()) as ChatResponse;
      return res.choices.map((choice) => choice.text);
    } else {
      const response = await callSidecar('chat', { text });

      if (response.status === 'error') {
        notifyError('Chat error', response.message);
        return [];
      }

      return response.choices.map((choice) => choice.text);
    }
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}
