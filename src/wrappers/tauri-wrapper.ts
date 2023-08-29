/**
 * This module muxes between the Tauri API and our hand-rolled stubs.
 *
 * Import symbols from here, not directly from @tauri-apps.
 */

import { invoke as tauriInvoke } from '@tauri-apps/api';
import * as tauriEvent from '@tauri-apps/api/event';
import * as tauriPath from '@tauri-apps/api/path';

import * as stubEvent from './tauri-api-stubs/event';
import { invokeStub } from './tauri-api-stubs/invokeStub';
import * as stubPath from './tauri-api-stubs/path';

// @tauri-apps/api
export const invoke = import.meta.env.VITE_IS_WEB ? invokeStub : tauriInvoke;

// @tauri-apps/api/path
export const desktopDir = import.meta.env.VITE_IS_WEB ? stubPath.desktopDir : tauriPath.desktopDir;
export const join = import.meta.env.VITE_IS_WEB ? stubPath.join : tauriPath.join;
export const sep = import.meta.env.VITE_IS_WEB ? stubPath.sep : tauriPath.sep;

// @tauri-apps/api/event
export const emit = import.meta.env.VITE_IS_WEB ? stubEvent.emit : tauriEvent.emit;
export const listen = import.meta.env.VITE_IS_WEB ? stubEvent.listen : tauriEvent.listen;
