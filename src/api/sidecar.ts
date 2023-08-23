/** Utility for calling into the Python sidecar with types. */

import { fetch as tauriFetch } from '@tauri-apps/api/http';
import { Child, ChildProcess, Command as TauriCommand } from '@tauri-apps/api/shell';

import { getCachedSetting } from '../settings/settingsManager';
import { CliCommands } from './types';

interface SharedCommand {
  execute: typeof TauriCommand.prototype.execute;
}

class StubCommand implements SharedCommand {
  command: string;
  args: string[];
  options: unknown;
  constructor(command: string, args: string[], options?: unknown) {
    this.command = command;
    this.args = args;
    this.options = options;
  }

  execute: typeof TauriCommand.prototype.execute = async () => {
    const [command, body] = this.args;
    const response = await fetch(`/api/sidecar/${command}`, {
      method: command === 'ingest_status' ? 'GET' : 'POST',
      body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const responsePayload = await response.text();
    if (response.ok) {
      return {
        signal: null,
        code: 0,
        stderr: '',
        stdout: responsePayload,
      };
    }
    return {
      signal: null,
      code: 1,
      stderr: response.statusText,
      stdout: responsePayload,
    };
  };
}

const Command = import.meta.env.VITE_IS_WEB ? StubCommand : TauriCommand;

export async function callSidecar<T extends keyof CliCommands>(
  subcommand: T,
  arg: CliCommands[T][0],
): Promise<CliCommands[T][1]> {
  const projectSettings = getCachedSetting('project');
  const openAISettings = getCachedSetting('openAI');
  const sidecarSettings = getCachedSetting('sidecar');
  const env: Record<string, string> = {
    // Paths
    PROJECT_DIR: projectSettings.currentDir,
    // Open AI
    OPENAI_API_KEY: openAISettings.apiKey,
    OPENAI_CHAT_MODEL: openAISettings.chatModel,
    // Sidecar
    SIDECAR_ENABLE_LOGGING: String(sidecarSettings.logging.active),
    SIDECAR_LOG_DIR: sidecarSettings.logging.path,
  };

  const command = new Command('call-sidecar', [subcommand, JSON.stringify(arg)], { env });
  console.log('sidecar command ' + subcommand, arg, command);
  const output = await command.execute();
  if (output.stderr) {
    const error = new Error('Error executing sidecar command');
    console.error(error, output.stderr);
    throw error;
  }
  console.log('sidecar output: ', output.stdout);

  const response = JSON.parse(output.stdout) as CliCommands[T][1];
  console.log('sidecar response', response);
  return response;
}

interface StartingState {
  state: 'starting';
}
interface FailedState {
  state: 'failed';
}
interface ReadyState {
  state: 'ready';
  process: Child;
}
type ServerState = StartingState | FailedState | ReadyState;

let serverProcess: ServerState | null = null;

export async function startServer() {
  console.log('Starting RefStudio server');
  const command = new TauriCommand('call-sidecar', ['serve']);
  command.stderr.addListener('data', (line) => {
    console.log('server stderr', line);
  });
  command.stdout.addListener('data', (line) => {
    console.log('server stdout', line);
  });
  command.addListener('close', (data: Pick<ChildProcess, 'code' | 'signal'>) => {
    console.warn('server closed', data.code, data.signal);
  });
  command.addListener('error', (data) => {
    console.error('server crashed', data);
  });
  return command.spawn();
}

export async function isServerHealthy() {
  try {
    const response = await tauriFetch('http://localhost:1487/api/meta/status');
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

export async function killServer() {
  if (serverProcess?.state === 'ready') {
    await serverProcess.process.kill();
  }
}

(window as any).startServer = startServer;
(window as any).killServer = killServer;
(window as any).isServerHealthy = isServerHealthy;

export async function getServer() {
  console.log('getServer');
  if (serverProcess) {
    if (serverProcess.state === 'ready') {
      return serverProcess.process;
    }
    return null;
  }
  serverProcess = { state: 'starting' };

  // Check if there's already a server process running. If so, kill it and start a new one.
  if (await isServerHealthy()) {
    console.log('Found existing API server; killing it before starting a new one.');
    await tauriFetch('http://localhost:1487/api/meta/shutdown', { method: 'POST' });
  }

  const process = await startServer();
  serverProcess = { state: 'ready', process };
  return process;
}

export function useRefStudioServer() {
  (async () => {
    await getServer();
  })().catch((e) => {
    console.error(e);
  });
}
