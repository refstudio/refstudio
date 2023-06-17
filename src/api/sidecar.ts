/** Utility for calling into the Python sidecar with types. */

import { Command } from '@tauri-apps/api/shell';

import { getCachedSetting } from '../settings/settings';
import { CliCommands } from './types';

export async function callSidecar<T extends keyof CliCommands>(subcommand: T, args: string[]): Promise<CliCommands[T]> {
  const openAISettings = getCachedSetting('openAI');
  const sidecarSettings = getCachedSetting('sidecar');
  const env: Record<string, string> = {
    // Open AI
    OPENAI_API_KEY: openAISettings.apiKey,
    OPENAI_CHAT_MODEL: openAISettings.chatModel,
    OPENAI_COMPLETE_MODEL: openAISettings.completeModel,
    // Sidecar
    SIDECAR_ENABLE_LOGGING: String(sidecarSettings.logging.active),
    SIDECAR_LOG_DIR: sidecarSettings.logging.path,
  };

  const command = new Command('call-sidecar', [subcommand, ...args], { env });
  console.log('command', command);
  const output = await command.execute();
  if (output.stderr) {
    throw new Error(output.stderr);
  }
  console.log('output: ', output.stdout);

  const response = JSON.parse(output.stdout) as CliCommands[T];
  console.log('response', response);
  return response;
}
