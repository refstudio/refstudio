import { emitEvent } from '../events';

export function notifyInfo(title: string, details?: string) {
  emitEvent('refstudio://notifications/new', { type: 'info', title, details });
}

export function notifyWarning(title: string, details?: string) {
  emitEvent('refstudio://notifications/new', { type: 'warning', title, details });
}

export function notifyError(title: string, details?: string) {
  emitEvent('refstudio://notifications/new', { type: 'error', title, details });
}

export function notifyErr(err: unknown, title?: string, details?: string) {
  title = title ?? (err instanceof Error ? err.message : 'Error');
  details = details ?? (err instanceof Error ? err.stack : String(err));
  emitEvent('refstudio://notifications/new', { type: 'error', title, details });
}
