declare module 'tauri-settings/dist/utils/dot-notation' {
  import { Path, PathValue } from 'tauri-settings/dist/types/dot-notation';
  // These functions are marked @internal but we find it convenient to use them.

  export function getDotNotation<SettingsSchema, K extends Path<SettingsSchema> = Path<SettingsSchema>>(
    settings: SettingsSchema,
    path: K,
  ): PathValue<SettingsSchema, K> | null;

  export function setDotNotation<SettingsSchema, K extends Path<SettingsSchema> = Path<SettingsSchema>>(
    settings: SettingsSchema,
    path: K,
    value: PathValue<SettingsSchema, K>,
  ): SettingsSchema;
}
