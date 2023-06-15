/** Utility for calling into the Python sidecar with types. */

import { Command } from '@tauri-apps/api/shell';

import { CliCommands } from './types';

export async function callSidecar<T extends keyof CliCommands>(subcommand: T, args: string[]): Promise<CliCommands[T]> {
  const command = new Command('call-sidecar', [subcommand, ...args]);
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
