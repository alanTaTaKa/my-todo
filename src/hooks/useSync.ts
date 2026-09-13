import { useCallback, useEffect, useRef, useState } from 'react'
import type { Tag, Task } from '../types'
import type { AuthUser } from '../lib/auth'
import { pullSync, pushSync, type SyncStatus } from '../lib/sync'

interface UseSyncOptions {
  user: AuthUser | null
  tasks: Task[]
  tags: Tag[]
  mergeTasks: (incoming: Task[]) => void
  mergeTags: (incoming: Tag[]) => void
}

export function useSync({ user, tasks, tags, mergeTasks, mergeTags }: UseSyncOptions) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cursor = useRef(0)
  const busy = useRef(false)
  const latest = useRef({ tasks, tags })

  useEffect(() => {
    latest.current = { tasks, tags }
  }, [tasks, tags])

  const syncNow = useCallback(async () => {
    if (!user || busy.current) return
    busy.current = true
    setStatus('syncing')
    setError(null)

    try {
      const pushed = await pushSync({
        tasks: latest.current.tasks,
        tags: latest.current.tags,
      })
      const pulled = await pullSync(cursor.current)
      mergeTasks([...pushed.tasks, ...pulled.tasks])
      mergeTags([...pushed.tags, ...pulled.tags])
      cursor.current = pulled.serverTime
      setLastSyncedAt(Date.now())
      setStatus('synced')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '同步失败，请稍后重试')
      setStatus('error')
    } finally {
      busy.current = false
    }
  }, [user, mergeTasks, mergeTags])

  useEffect(() => {
    cursor.current = 0
    if (!user) return undefined
    const handle = window.setTimeout(() => void syncNow(), 0)
    return () => window.clearTimeout(handle)
  }, [user, syncNow])

  useEffect(() => {
    if (!user) return undefined
    const handle = window.setTimeout(() => void syncNow(), 1200)
    return () => window.clearTimeout(handle)
  }, [user, tasks, tags, syncNow])

  useEffect(() => {
    if (!user) return undefined
    const onFocus = () => void syncNow()
    const onOnline = () => void syncNow()
    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onOnline)
    const interval = window.setInterval(() => void syncNow(), 60_000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onOnline)
      window.clearInterval(interval)
    }
  }, [user, syncNow])

  return {
    status: user ? status : 'idle',
    lastSyncedAt: user ? lastSyncedAt : null,
    error: user ? error : null,
    syncNow,
  }
}
