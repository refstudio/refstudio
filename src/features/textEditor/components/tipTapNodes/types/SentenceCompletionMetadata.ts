interface CloseMetadata {
  action: 'close';
}

interface OpenMetadata {
  action: 'open';
  query: string;
}

interface PopulateMetadata {
  action: 'populate';
  suggestionChoices: string[];
}

export type SentenceCompletionMetadata = CloseMetadata | OpenMetadata | PopulateMetadata;
export function createCloseAction(): SentenceCompletionMetadata {
  return { action: 'close' };
}
export function createPopulateAction(suggestionChoices: string[]): SentenceCompletionMetadata {
  return {
    action: 'populate',
    suggestionChoices,
  };
}

export function createOpenAction(query: string): SentenceCompletionMetadata {
  return {
    action: 'open',
    query,
  };
}
