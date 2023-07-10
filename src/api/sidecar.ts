/** Utility for calling into the Python sidecar with types. */

import { Command } from '@tauri-apps/api/shell';

import { getCachedSetting } from '../settings/settingsManager';
import { CliCommands } from './types';

export async function callSidecar<
  T extends keyof CliCommands,
  CliCommandRequest = CliCommands[T][0],
  CliCommandResponse = CliCommands[T][1],
>(subcommand: T, arg: CliCommandRequest): Promise<CliCommandResponse> {
  const generalSettings = getCachedSetting('general');
  const openAISettings = getCachedSetting('openAI');
  const sidecarSettings = getCachedSetting('sidecar');
  const env: Record<string, string> = {
    // Paths
    APP_DATA_DIR: generalSettings.appDataDir,
    PROJECT_NAME: generalSettings.projectName,
    // Open AI
    OPENAI_API_KEY: openAISettings.apiKey,
    OPENAI_CHAT_MODEL: openAISettings.chatModel,
    OPENAI_COMPLETE_MODEL: openAISettings.completeModel,
    // Sidecar
    SIDECAR_ENABLE_LOGGING: String(sidecarSettings.logging.active),
    SIDECAR_LOG_DIR: sidecarSettings.logging.path,
  };

  const command = new Command('call-sidecar', [subcommand, JSON.stringify(arg)], { env });
  console.log('sidecar command ' + subcommand, arg, command);
  const output = await command.execute();
  if (output.stderr) {
    const error = new Error('Error executing sidecar command');
    console.log(error, output.stderr);
    throw error;
  }
  console.log('sidecar output: ', output.stdout);

  const response = JSON.parse(output.stdout) as CliCommandResponse;
  console.log('sidecar response', response);
  return response;
}
