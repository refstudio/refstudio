import { notifyErr, notifyError, notifyInfo, notifyWarning } from './notifications';

const { log, warn, error } = console;

export function prefixTitle(title: unknown) {
  return `(console) ${String(title)}`;
}

/**
 * Intercept all console.* calls and call notify
 *
 * @param interceptLog true to intercept console.log calls
 * @param interceptWarning true to intecerpt console.warn calls
 * @param interceptError true to intercept console.error calls
 * @returns reset function to remove interceptors
 */
export function interceptConsoleMessages(interceptLog = true, interceptWarning = true, interceptError = true) {
  console.log = interceptLog
    ? (message?: unknown, ...optionalParams: unknown[]) => {
        notifyInfo(prefixTitle(message), formatOptionalParams(optionalParams));
        log.apply(console, [message, ...optionalParams]);
      }
    : log;

  console.warn = interceptWarning
    ? (message?: unknown, ...optionalParams: unknown[]) => {
        notifyWarning(prefixTitle(message), formatOptionalParams(optionalParams));
        warn.apply(console, [message, ...optionalParams]);
      }
    : warn;

  console.error = interceptError
    ? (message?: unknown, ...optionalParams: unknown[]) => {
        const [firstOptional] = optionalParams;

        if (message instanceof Error) {
          // Sometimes the `message` is an Error.
          notifyErr(message);
        } else if (firstOptional instanceof Error) {
          // Sometimes the `firstOptional` is an Error. Let's use that and override the title
          notifyErr(firstOptional, prefixTitle(message));
        } else {
          // Otherwise a simple error message
          notifyError(prefixTitle(message), formatOptionalParams(optionalParams));
        }

        return error.apply(console, [message, ...optionalParams]);
      }
    : error;

  // Reset handler
  return () => {
    console.log = log;
    console.warn = warn;
    console.error = error;
  };
}

function formatOptionalParams(optionalParams: unknown[]) {
  if (optionalParams.length === 0) {
    return undefined;
  }

  const output = optionalParams.map((param) => JSON.stringify(param, null, 2)).join('\n');
  return output;
}
