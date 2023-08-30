import { notifyError } from '../notifications/notifications';
import { apiPost } from './typed-api';

export async function completeSentence(text: string): Promise<string[]> {
  try {
    if (text.trim() === '') {
      return [];
    }

    // const response = await universalPost<TextCompletionResponse, TextCompletionRequest>('/api/ai/completion', {
    const response = await apiPost('/api/ai/completion', {
      text,
      n_choices: 3,
    });

    if (response.status === 'error') {
      notifyError('Completion error', response.message);
      return [];
    }

    return response.choices.map((suggestion) => suggestion.text);
  } catch (err) {
    console.error('Completion error', err);
    return [];
  }
}
