import { ReferenceItem } from './ReferenceItem';

export interface EditorAPI {
  insertReference(reference: ReferenceItem): void;
}
