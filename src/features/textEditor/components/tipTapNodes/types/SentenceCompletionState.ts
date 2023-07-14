interface ClosedSentenceCompletionState {
  status: 'closed';
}

interface PendingSentenceCompletionState {
  status: 'pending';
  pos: number;
  query: string;
}

interface OpenSentenceCompletionState {
  status: 'open';
  index: number;
  pos: number;
  suggestionChoices: string[];
}

export type SentenceCompletionState =
  | ClosedSentenceCompletionState
  | PendingSentenceCompletionState
  | OpenSentenceCompletionState;
