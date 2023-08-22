/** Utility for calling into the Python sidecar with types. */

import { Command as TauriCommand } from '@tauri-apps/api/shell';

import { getCachedSetting } from '../settings/settingsManager';
import { CliCommands } from './types';

interface SharedCommand {
  execute: typeof TauriCommand.prototype.execute;
}
interface StubCommandOptions {
  env: Record<string, string>;
}

class StubCommand implements SharedCommand {
  command: string;
  args: string[];
  options: StubCommandOptions;
  constructor(command: string, args: string[], options: StubCommandOptions) {
    this.command = command;
    this.args = args;
    this.options = options;
  }

  execute: typeof TauriCommand.prototype.execute = async () => {
    const [command, body] = this.args;

    const envHeaders = Object.entries(this.options.env).reduce(
      (acc, [key, value]) => ({ ...acc, [`X-${key.toUpperCase()}`]: value }),
      {},
    );

    const response = await fetch(`/api/sidecar/${command}`, {
      method: command === 'ingest_status' ? 'GET' : 'POST',
      body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...envHeaders,
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
