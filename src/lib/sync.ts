import type { Tag, Task } from '../types'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

export interface SyncResponse {
  serverTime: number
  tasks: Task[]
  tags: Tag[]
}

async function request(path: string, init?: RequestInit): Promise<SyncResponse> {
  let response: Response
  try {
    response = await fetch(path, {
      credentials: 'include',
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error('无法连接服务器，请稍后重试')
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('登录状态已失效，请重新登录')
    }
    let message = '同步失败，请稍后重试'
    try {
      const data = (await response.json()) as { error?: unknown }
      if (typeof data.error === 'string' && data.error) message = data.error
    } catch {
      // 响应不是 JSON，使用兜底文案
    }
    throw new Error(message)
  }

  return (await response.json()) as SyncResponse
}

export function pullSync(since: number): Promise<SyncResponse> {
  const query = since > 0 ? `?since=${encodeURIComponent(String(since))}` : ''
  return request(`/api/sync${query}`)
}

export function pushSync(payload: {
  tasks: Task[]
  tags: Tag[]
}): Promise<SyncResponse> {
  return request('/api/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
