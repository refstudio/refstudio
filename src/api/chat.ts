import { apiPost } from './api';

export async function chatWithAI(projectId: string, text: string): Promise<string[]> {
  try {
    if (!text) {
      return [];
    }
    // const res = await universalPost<ChatResponse, ChatRequest>(`/api/ai/${projectId}/chat`, { text, n_choices: 3 });
    const res = await apiPost('/api/ai/{project_id}/chat', { path: { project_id: projectId } }, { text, n_choices: 3 });
    return res.choices.map((choice) => choice.text);
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}
