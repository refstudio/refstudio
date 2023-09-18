import { fetchEventSource } from '@microsoft/fetch-event-source';

import { apiPost } from './typed-api';

export async function chatWithAI(projectId: string, question: string): Promise<string[]> {
  try {
    if (!question) {
      return [];
    }
    const res = await apiPost(
      '/api/ai/{project_id}/chat',
      { path: { project_id: projectId } },
      { text: question, n_choices: 3 },
    );
    return res.choices.map((choice) => choice.text);
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}

export async function chatWithAiStreaming(
  projectId: string,
  question: string,
  onText: (part: string, full: string) => void,
): Promise<string> {
  if (!question) {
    return '';
  }

  let fullText = '';
  return fetchEventSource(`/api/ai/${projectId}/chat_stream`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      text: question,
    }),
    onmessage: (msg) => {
      fullText += msg.data;
      onText(msg.data, fullText);
    },
  })
    .then(() => fullText)
    .catch((err) => `Chat error: ${String(err)}`);
}
