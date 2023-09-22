import { atom } from 'jotai';

interface ChatThreadItem {
  id: string;
  question: string;
  answer?: string;
}
export type ChatThread = ChatThreadItem[];

export const chatThreadAtom = atom<ChatThread>([]);

// {
//   id: '1',
//   question: 'What is your name?',
//   answer:
//     'I am an AI language model and do not have a name. How may I assist you with your query related to the given context?',
// },
// {
//   id: '2',
//   question: 'What can you tell me about hidden feedback loops in machine learning?',
//   answer:
//     'Hidden feedback loops in machine learning refer to situations where two systems indirectly influence each other through the world, leading to changes in behavior that may not be immediately visible. These loops may exist between completely disjoint systems and can make analyzing the effect of proposed changes extremely difficult, adding cost to even simple improvements. It is recommended to look carefully for hidden feedback loops and remove them whenever feasible.',
// },
