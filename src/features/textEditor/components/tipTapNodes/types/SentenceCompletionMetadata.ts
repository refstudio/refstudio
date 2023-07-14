interface CloseMetadata {
  type: 'close';
}

interface OpenMetadata {
  type: 'open';
  query: string;
}

interface PopulateMetadata {
  type: 'populate';
  suggestionChoices: string[];
}

export type SentenceCompletionMetadata = CloseMetadata | OpenMetadata | PopulateMetadata;
