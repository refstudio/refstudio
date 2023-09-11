/** Code for managing the connection the RefStudio server. This is only relevant for desktop. */

import { emit } from '@tauri-apps/api/event';
import { fetch as tauriFetch } from '@tauri-apps/api/http';
import { Child, ChildProcess, Command as TauriCommand } from '@tauri-apps/api/shell';
import React from 'react';

import { noop } from '../lib/noop';

export const REFSTUDIO_HOST = 'http://localhost:1487';

interface StartingState {
  state: 'starting';
}
/** Process has started but is not yet accepting HTTP requests. */
interface WaitingState {
  state: 'waiting';
  process: Child;
}
/** Process is ready to serve. */
interface ServingState {
  state: 'serving';
  process: Child;
}
type ServerState = StartingState | WaitingState | ServingState;

// A null value means that no one has requested a server yet.
let serverProcess: ServerState | null = null;

async function startServer(servingCallback: () => void) {
  console.log('Starting RefStudio server');
  const command = new TauriCommand('call-sidecar', ['serve']);
  command.stderr.addListener('data', (line) => {
    console.log('server stderr', line);
    void emit('server-logs', line);
    if (line.includes('running on http')) {
      console.log('matched the magic words');
      servingCallback();
    }
  });
  command.stdout.addListener('data', (line) => {
    void emit('server-logs', line);
    console.log('server stdout', line);
  });
  command.addListener('close', (data: Pick<ChildProcess, 'code' | 'signal'>) => {
    void emit('server-logs', 'server closed, restarting');
    console.warn('server closed, restarting', data.code, data.signal);
    serverProcess = null;
    void getOrStartServer(noop);
  });
  command.addListener('error', (data) => {
    void emit('server-logs', 'server crashed, restarting');
    console.error('server crashed, restarting', data);
    serverProcess = null;
    void getOrStartServer(noop);
  });
  return command.spawn();
}

/** Hit the status endpoint on the server to determine whether it's running and healthy. */
async function isServerHealthy() {
  try {
    const response = await tauriFetch(`${REFSTUDIO_HOST}/api/meta/status`);
    if (!response.ok) {
      return false;
    }
    console.log(response.data);
    const { status } = response.data as { status: string };
    if (status !== 'ok') {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/** Kill an existing server under our management if there is one. This will trigger a restart. */
async function killServer() {
  if (serverProcess?.state === 'waiting' || serverProcess?.state === 'serving') {
    await serverProcess.process.kill();
  }
}

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).killServer = killServer;
}

/** Get a reference to an existing server under our management, starting one if necessary. */
async function getOrStartServer(servingCallback: () => void) {
  if (serverProcess) {
    if (serverProcess.state === 'waiting' || serverProcess.state === 'serving') {
      return serverProcess.process;
    }
    return null;
  }
  serverProcess = { state: 'starting' };

  // Check if there's already a server process running. If so, kill it and start a new one.
  if (await isServerHealthy()) {
    console.log('Found existing API server; killing it before starting a new one.');
    try {
      await tauriFetch(`${REFSTUDIO_HOST}/api/meta/shutdown`, { method: 'POST' });
    } catch (e) {
      // Failure is expected here since the server shuts down before responding.
    }
  }

  const process = await startServer(() => {
    serverProcess = { state: 'serving', process };
    servingCallback();
  });
  serverProcess = { state: 'waiting', process };
  return process;
}

/**
 * Ensure there is exactly one RefStudio server running.
 *
 * Repeated calls have no effect. The server will terminate when the RefStudio app terminates.
 * If an existing server not managed by us is already running, it will be killed. (This can happen
 * when you run Tauri Desktop in dev mode and make TypeScript changes.)
 */
export function useRefStudioServerOnDesktop() {
  // the server is always running for the web version
  const [isServerRunning, setIsServerRunning] = React.useState(true); // !!import.meta.env.VITE_IS_WEB);

  React.useEffect(() => {
    if (isServerRunning) {
      return;
    }
    (async () => {
      await getOrStartServer(() => {
        console.log('setting isServerRunning');
        setIsServerRunning(true);
      });
    })().catch((e) => {
      // void showMessage(String(e), { title: 'ERROR', type: 'error' });
      void emit('server-logs', 'STARTUP ERROR: ' + String(e));
      console.error(e);
    });
  }, [isServerRunning]);

  return isServerRunning;
}
