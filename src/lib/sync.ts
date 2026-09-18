import type { Tag, Task, UserProfile } from '../types'
import type { SavedPalette } from './palettes'
import { apiRequest } from './api'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

export interface SyncResponse {
  serverTime: number
  tasks: Task[]
  tags: Tag[]
  palettes: SavedPalette[]
  profile: UserProfile | null
}

export function pullSync(since: number): Promise<SyncResponse> {
  const query = since > 0 ? `?since=${encodeURIComponent(String(since))}` : ''
  return apiRequest<SyncResponse>(`/api/sync${query}`)
}

export function pushSync(payload: {
  tasks: Task[]
  tags: Tag[]
  palettes: SavedPalette[]
  profile: UserProfile | null
}): Promise<SyncResponse> {
  return apiRequest<SyncResponse>('/api/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
