/** Utility for calling into the Python sidecar with types. */

import { Command } from '@tauri-apps/api/shell';

import { CliSchema } from './cli';

export async function callSidecar<T extends keyof CliSchema>(subcommand: T, args: string[]): Promise<CliSchema[T]> {
  const command = new Command('call-sidecar', [subcommand, ...args]);
  console.log('command', command);
  const output = await command.execute();
  const response = JSON.parse(output.stdout) as CliSchema[T];
  console.log('response', response);
  return response;
}
