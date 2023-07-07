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

/* -----------------------------------------------------------------
 * Intercept all console.* calls and call notify
 *
 * - Toggle CONSOLE_LOG_INTERCEPTOR_ENABLED to disable the behavior
 * ----------------------------------------------------------------- */
const CONSOLE_LOG_INTERCEPTOR_ENABLED = true;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (CONSOLE_LOG_INTERCEPTOR_ENABLED) {
  const { log, warn, error } = console;
  console.log = (message?: unknown, ...optionalParams: unknown[]) => {
    notifyInfo(String(message), formatOptionalParams(...optionalParams));
    log.apply(console, [message, ...optionalParams]);
  };

  console.warn = (message?: unknown, ...optionalParams: unknown[]) => {
    notifyWarning(String(message), formatOptionalParams(...optionalParams));
    warn.apply(console, [message, ...optionalParams]);
  };

  console.error = (message?: unknown, ...optionalParams: unknown[]) => {
    const [firstOptional] = optionalParams;

    if (message instanceof Error) {
      // Sometimes the `message` is an Error.
      notifyErr(firstOptional);
    } else if (firstOptional instanceof Error) {
      // Sometimes the `firstOptional` is an Error. Let's use that and override the title
      notifyErr(firstOptional);
    } else {
      // Otherwise a simple error message
      notifyError(String(message), formatOptionalParams(...optionalParams));
    }

    return error.apply(console, [message, ...optionalParams]);
  };
}

function formatOptionalParams(...optionalParams: unknown[]) {
  if (optionalParams.length === 0) {
    return undefined;
  }

  return optionalParams.map((param) => JSON.stringify(param, null, 2)).join('\n');
}
