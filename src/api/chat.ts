import { apiPost, apiPostStream } from './typed-api';

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

  let fullReply = '';
  return apiPostStream(
    '/api/ai/{project_id}/chat_stream',
    { path: { project_id: projectId } },
    { text: question },
    (replyChunk) => {
      fullReply += replyChunk;
      onText(replyChunk, fullReply);
    },
  )
    .then(() => fullReply)
    .catch((err) => `Chat error: ${String(err)}`);
}

export async function chatInteraction(
  projectId: string,
  question: string,
  onText: (part: string, full: string) => void,
): Promise<string> {
  if (import.meta.env.VITE_IS_WEB) {
    return chatWithAiStreaming(projectId, question, onText);
  }

  return chatWithAI(projectId, question).then((reply) => {
    const fullReply = reply.join('\n');
    onText(fullReply, fullReply);
    return fullReply;
  });
}
