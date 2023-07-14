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
  visibleChoiceIndex: number;
  pos: number;
  suggestionChoices: string[];
}

interface ErrorSentenceCompletionState {
  pos: number;
  status: 'error';
  text: string;
}

export type SentenceCompletionState =
  | ClosedSentenceCompletionState
  | PendingSentenceCompletionState
  | OpenSentenceCompletionState
  | ErrorSentenceCompletionState;
