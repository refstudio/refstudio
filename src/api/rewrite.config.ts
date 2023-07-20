export const REWRITE_MANNER: RewriteOptions['manner'][] = ['concise', 'elaborate', 'scholarly'];

export interface RewriteOptions {
  nChoices?: number;
  manner?: 'concise' | 'elaborate' | 'scholarly';
  temperature?: number; // between 0.7 and 0.9
}

export const DEFAULT_OPTIONS: RewriteOptions = {
  nChoices: 3,
  manner: 'concise',
  temperature: 0.7,
};
