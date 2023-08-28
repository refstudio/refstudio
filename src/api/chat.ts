import { universalPost } from './api';
import { ChatRequest, ChatResponse } from './types';

export async function chatWithAI(projectId: string, text: string): Promise<string[]> {
  try {
    if (!text) {
      return [];
    }
    const res = await universalPost<ChatResponse, ChatRequest>(`/api/ai/${projectId}/chat`, { text });
    return res.choices.map((choice) => choice.text);
  } catch (err) {
    return [`Chat error: ${String(err)}`];
  }
}
