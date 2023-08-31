import { apiPost } from './typed-api';

export async function chatWithAI(projectId: string, text: string): Promise<string[]> {
  try {
    if (!text) {
      return [];
    }
    const res = await apiPost('/api/ai/{project_id}/chat', { path: { project_id: projectId } }, { text, n_choices: 3 });
    return res.choices.map((choice) => choice.text);
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}
