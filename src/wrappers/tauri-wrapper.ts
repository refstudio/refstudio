/**
 * This module muxes between the Tauri API and our hand-rolled stubs.
 *
 * Import symbols from here, not directly from @tauri-apps.
 */

import { invoke as tauriInvoke } from '@tauri-apps/api';
import * as tauriEvent from '@tauri-apps/api/event';
import * as tauriFs from '@tauri-apps/api/fs';
import * as tauriPath from '@tauri-apps/api/path';

import * as stubEvent from './tauri-api-stubs/event';
import { invokeStub } from './tauri-api-stubs/invokeStub';
import * as stubPath from './tauri-api-stubs/path';

// @tauri-apps/api
export const invoke = import.meta.env.VITE_IS_WEB ? invokeStub : tauriInvoke;

// @tauri-apps/api/path
export const appConfigDir = import.meta.env.VITE_IS_WEB ? stubPath.appConfigDir : tauriPath.appConfigDir;
export const desktopDir = import.meta.env.VITE_IS_WEB ? stubPath.desktopDir : tauriPath.desktopDir;
export const join = import.meta.env.VITE_IS_WEB ? stubPath.join : tauriPath.join;
export const sep = import.meta.env.VITE_IS_WEB ? stubPath.sep : tauriPath.sep;

// @tauri-apps/api/fs
export const createDir = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.createDir;
export const exists = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.exists;
export const readBinaryFile = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.readBinaryFile;
export const readTextFile = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.readTextFile;
export const readDir = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.readDir;
export const removeDir = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.removeDir;
export const removeFile = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.removeFile;
export const writeTextFile = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.writeTextFile;
export const writeBinaryFile = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.writeBinaryFile;
export const renameFile = import.meta.env.VITE_IS_WEB ? dontUseFsInWeb : tauriFs.renameFile;

// @tauri-apps/api/event
export const emit = import.meta.env.VITE_IS_WEB ? stubEvent.emit : tauriEvent.emit;
export const listen = import.meta.env.VITE_IS_WEB ? stubEvent.listen : tauriEvent.listen;

function dontUseFsInWeb() {
  throw new Error('Dont use FS in the WEB. Use the HTTP API instead');
}
