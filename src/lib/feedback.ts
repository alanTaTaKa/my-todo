import { apiRequest } from './api'

export async function submitFeedback(input: {
  content: string
  contact?: string
}): Promise<void> {
  await apiRequest<{ ok: boolean }>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
