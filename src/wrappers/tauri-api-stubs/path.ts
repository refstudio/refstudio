// Stubs for @tauri-apps/api/path

import * as tauriPath from '@tauri-apps/api/path';

export const desktopDir: typeof tauriPath.desktopDir = () => Promise.resolve('/Users/refstudio/Desktop/');

export const sep: typeof tauriPath.sep = '/';

// NOTE: might need to resolve ".." and leading "/"
export const join: typeof tauriPath.join = (...args) => Promise.resolve(args.join(sep));
