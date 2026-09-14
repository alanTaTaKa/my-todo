import { useCallback, useEffect, useRef, useState } from 'react'
import type { Tag, Task } from '../types'
import type { AuthUser } from '../lib/auth'
import {
  pullSync,
  pushSync,
  type SyncResponse,
  type SyncStatus,
} from '../lib/sync'
import { loadActiveSyncUser, saveActiveSyncUser } from '../lib/storage'

interface UseSyncOptions {
  user: AuthUser | null
  tasks: Task[]
  tags: Tag[]
  mergeTasks: (incoming: Task[]) => void
  mergeTags: (incoming: Tag[]) => void
  resetTasks: () => void
  resetTags: () => void
}

const BASE_RETRY_MS = 5000
const MAX_RETRY_MS = 300000
const DEBOUNCE_MS = 1200
const HEARTBEAT_MS = 60000

function maxUpdatedAt(items: { updatedAt: number }[]): number {
  let max = 0
  for (const item of items) {
    if (item.updatedAt > max) max = item.updatedAt
  }
  return max
}

export function useSync({
  user,
  tasks,
  tags,
  mergeTasks,
  mergeTags,
  resetTasks,
  resetTags,
}: UseSyncOptions) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cursor = useRef(0)
  const lastPushed = useRef(-1)
  const skipPush = useRef(false)
  const busy = useRef(false)
  const retryDelay = useRef(BASE_RETRY_MS)
  const retryTimer = useRef<number | null>(null)
  const syncNowRef = useRef<() => void>(() => {})
  const latest = useRef({ tasks, tags })

  useEffect(() => {
    latest.current = { tasks, tags }
  }, [tasks, tags])

  const clearRetry = useCallback(() => {
    if (retryTimer.current !== null) {
      window.clearTimeout(retryTimer.current)
      retryTimer.current = null
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!user || busy.current) return

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('offline')
      setError(null)
      return
    }

    busy.current = true
    setStatus('syncing')
    setError(null)

    try {
      const snapshot = latest.current
      const changedTasks = snapshot.tasks.filter(
        (task) => task.updatedAt > lastPushed.current,
      )
      const changedTags = snapshot.tags.filter(
        (tag) => tag.updatedAt > lastPushed.current,
      )

      let pushed: SyncResponse | null = null
      if (!skipPush.current && (changedTasks.length > 0 || changedTags.length > 0)) {
        pushed = await pushSync({ tasks: changedTasks, tags: changedTags })
      }
      skipPush.current = false

      const pulled = await pullSync(cursor.current)
      const incomingTasks = pushed ? [...pushed.tasks, ...pulled.tasks] : pulled.tasks
      const incomingTags = pushed ? [...pushed.tags, ...pulled.tags] : pulled.tags

      mergeTasks(incomingTasks)
      mergeTags(incomingTags)

      const localMax = Math.max(
        maxUpdatedAt(snapshot.tasks),
        maxUpdatedAt(snapshot.tags),
      )
      const remoteMax = Math.max(
        maxUpdatedAt(incomingTasks),
        maxUpdatedAt(incomingTags),
      )
      lastPushed.current = Math.max(lastPushed.current, localMax, remoteMax)
      cursor.current = pulled.serverTime

      retryDelay.current = BASE_RETRY_MS
      clearRetry()
      setLastSyncedAt(Date.now())
      setStatus('synced')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '同步失败，请稍后重试')
      setStatus('error')
      clearRetry()
      const delay = retryDelay.current
      retryDelay.current = Math.min(delay * 3, MAX_RETRY_MS)
      retryTimer.current = window.setTimeout(() => syncNowRef.current(), delay)
    } finally {
      busy.current = false
    }
  }, [user, mergeTasks, mergeTags, clearRetry])

  useEffect(() => {
    syncNowRef.current = () => {
      void syncNow()
    }
  }, [syncNow])

  useEffect(() => {
    cursor.current = 0
    lastPushed.current = -1
    retryDelay.current = BASE_RETRY_MS
    clearRetry()

    if (!user) return undefined

    const active = loadActiveSyncUser()
    if (active && active !== user.id) {
      resetTasks()
      resetTags()
      skipPush.current = true
    }
    saveActiveSyncUser(user.id)

    const handle = window.setTimeout(() => void syncNow(), 0)
    return () => window.clearTimeout(handle)
  }, [user, syncNow, resetTasks, resetTags, clearRetry])

  useEffect(() => {
    if (!user) return undefined
    const handle = window.setTimeout(() => void syncNow(), DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [user, tasks, tags, syncNow])

  useEffect(() => {
    if (!user) return undefined
    const onFocus = () => void syncNow()
    const onOnline = () => void syncNow()
    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onOnline)
    const interval = window.setInterval(() => void syncNow(), HEARTBEAT_MS)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onOnline)
      window.clearInterval(interval)
    }
  }, [user, syncNow])

  useEffect(() => () => clearRetry(), [clearRetry])

  return {
    status: user ? status : 'idle',
    lastSyncedAt: user ? lastSyncedAt : null,
    error: user ? error : null,
    syncNow,
  }
}
