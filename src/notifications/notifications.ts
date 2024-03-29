import { emitEvent } from '../events';
import { NotificationItemType } from './types';

export function notifyInfo(title: string, details?: string) {
  emitEvent('refstudio://notifications/new', { type: 'info', title, details });
}

export function notifyWarning(title: string, details?: string) {
  emitEvent('refstudio://notifications/new', { type: 'warning', title, details });
}

export function notifyError(title: string, details?: string) {
  emitEvent('refstudio://notifications/new', { type: 'error', title, details });
}

/**
 * Specialized notifyError utility for Errors (eg. for try/catch)
 *
 * @param err we use unknown instead of Error to simplify the code: `try { .. } catch(err) { notifyErr(err) }`
 * @param title optional title override
 * @param details optional notification details payload
 */
export function notifyErr(err: unknown, title?: string, details?: string) {
  title = title ?? (err instanceof Error ? err.message : 'Error');
  details = details ?? (err instanceof Error ? err.stack : String(err));
  emitEvent('refstudio://notifications/new', { type: 'error', title, details });
}

export function clearNotifications(type?: NotificationItemType) {
  emitEvent('refstudio://notifications/clear', { type });
}

export function showNotifications(type?: NotificationItemType) {
  emitEvent('refstudio://notifications/popup/open', { type });
}

export function hideNotifications() {
  emitEvent('refstudio://notifications/popup/close');
}
