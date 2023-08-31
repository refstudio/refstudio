/** Utility for calling into the Python sidecar with types. */

import { Command } from '@tauri-apps/api/shell';

import { getCachedSetting } from '../settings/settingsManager';
import { CliCommands } from './types';

export async function callSidecar<T extends keyof CliCommands>(
  subcommand: T,
  arg: CliCommands[T][0],
): Promise<CliCommands[T][1]> {
  const projectSettings = getCachedSetting('project');
  const openAISettings = getCachedSetting('openai');
  const sidecarSettings = getCachedSetting('sidecar');
  const env: Record<string, string> = {
    // Paths
    PROJECT_DIR: projectSettings.current_directory,
    // Open AI
    OPENAI_API_KEY: openAISettings.api_key,
    OPENAI_CHAT_MODEL: openAISettings.chat_model,
    // Sidecar
    SIDECAR_ENABLE_LOGGING: String(sidecarSettings.logging.enable),
    SIDECAR_LOG_DIR: sidecarSettings.logging.filepath,
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
