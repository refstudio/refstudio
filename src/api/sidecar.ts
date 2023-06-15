/** Utility for calling into the Python sidecar with types. */

import { Command } from '@tauri-apps/api/shell';

import { getSettings } from '../settings/settings';
import { CliSchema } from './types';

export async function callSidecar<T extends keyof CliSchema>(subcommand: T, args: string[]): Promise<CliSchema[T]> {
  const openAISettings = getSettings().getCache('openAI');
  const env: Record<string, string> = {
    OPENAI_API_KEY: openAISettings.apiKey,
    OPENAI_COMPLETE_MODEL: openAISettings.completeModel,
    OPENAI_CHAT_MODEL: openAISettings.chatModel,
  };

  const command = new Command('call-sidecar', [subcommand, ...args], { env });
  console.log('command', command);
  const output = await command.execute();
  if (output.stderr) {
    throw new Error(output.stderr);
  }
  console.log('output: ', output.stdout);
  const response = JSON.parse(output.stdout) as CliSchema[T];
  console.log('response', response);
  return response;
}
