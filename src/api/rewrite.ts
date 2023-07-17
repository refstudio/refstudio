import { notifyError } from '../notifications/notifications';
import { callSidecar } from './sidecar';

export const REWRITE_MANNER: RewriteOptions['manner'][] = ['concise', 'elaborate', 'scholarly'];
export interface RewriteOptions {
  nChoices?: number;
  manner?: 'concise' | 'elaborate' | 'scholarly';
  temperature?: number; // between 0.7 and 0.9
}

export const DEFAULT_OPTIONS: RewriteOptions = {
  nChoices: 3,
  manner: 'concise',
  temperature: 0.7,
};

export async function askForRewrite(selection: string, options?: RewriteOptions): Promise<string[]> {
  try {
    if (selection.trim() === '') {
      return [''];
    }

    options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    const response = await callSidecar('rewrite', {
      text: selection,
      n_choices: options.nChoices,
      temperature: options.temperature,
      manner: options.manner,
    });

    if (response.status === 'error') {
      notifyError('Rewrite error', response.message);
      return [''];
    }

    return response.choices.map((ch) => ch.text);
  } catch (err) {
    return [`Rewrite error: ${String(err)}`];
  }
}
