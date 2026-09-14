import { useCallback, useEffect, useRef, useState } from 'react'
import type { Tag, Task, UserProfile } from '../types'
import type { SavedPalette } from '../lib/palettes'
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
  palettes: SavedPalette[]
  profile: UserProfile
  mergeTasks: (incoming: Task[]) => void
  mergeTags: (incoming: Tag[]) => void
  mergePalettes: (incoming: SavedPalette[]) => void
  mergeProfile: (incoming: UserProfile | null) => void
  resetTasks: () => void
  resetTags: () => void
  resetPalettes: () => void
  resetProfile: () => void
}

const BASE_RETRY_MS = 5000
const MAX_RETRY_MS = 300000
const DEBOUNCE_MS = 1200
const VISIBLE_POLL_MS = 5000
const HIDDEN_POLL_MS = 60000

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
  palettes,
  profile,
  mergeTasks,
  mergeTags,
  mergePalettes,
  mergeProfile,
  resetTasks,
  resetTags,
  resetPalettes,
  resetProfile,
}: UseSyncOptions) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cursor = useRef(0)
  const lastPushed = useRef(-1)
  const skipPush = useRef(false)
  const busy = useRef(false)
  const pending = useRef(false)
  const retryDelay = useRef(BASE_RETRY_MS)
  const retryTimer = useRef<number | null>(null)
  const syncNowRef = useRef<() => void>(() => {})
  const latest = useRef({ tasks, tags, palettes, profile })

  useEffect(() => {
    latest.current = { tasks, tags, palettes, profile }
  }, [tasks, tags, palettes, profile])

  const clearRetry = useCallback(() => {
    if (retryTimer.current !== null) {
      window.clearTimeout(retryTimer.current)
      retryTimer.current = null
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!user) return

    if (busy.current) {
      pending.current = true
      return
    }

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
      const changedPalettes = snapshot.palettes.filter(
        (palette) => palette.updatedAt > lastPushed.current,
      )
      const profileChanged = snapshot.profile.updatedAt > lastPushed.current

      let pushed: SyncResponse | null = null
      if (
        !skipPush.current &&
        (changedTasks.length > 0 ||
          changedTags.length > 0 ||
          changedPalettes.length > 0 ||
          profileChanged)
      ) {
        pushed = await pushSync({
          tasks: changedTasks,
          tags: changedTags,
          palettes: changedPalettes,
          profile: snapshot.profile,
        })
      }
      skipPush.current = false

      const pulled = await pullSync(cursor.current)
      const incomingTasks = pushed ? [...pushed.tasks, ...pulled.tasks] : pulled.tasks
      const incomingTags = pushed ? [...pushed.tags, ...pulled.tags] : pulled.tags
      const incomingPalettes = pushed
        ? [...pushed.palettes, ...pulled.palettes]
        : pulled.palettes

      mergeTasks(incomingTasks)
      mergeTags(incomingTags)
      mergePalettes(incomingPalettes)
      mergeProfile(pushed?.profile ?? null)
      mergeProfile(pulled.profile)

      const remoteProfileUpdatedAt = Math.max(
        pushed?.profile?.updatedAt ?? 0,
        pulled.profile?.updatedAt ?? 0,
      )
      const localMax = Math.max(
        maxUpdatedAt(snapshot.tasks),
        maxUpdatedAt(snapshot.tags),
        maxUpdatedAt(snapshot.palettes),
        snapshot.profile.updatedAt,
      )
      const remoteMax = Math.max(
        maxUpdatedAt(incomingTasks),
        maxUpdatedAt(incomingTags),
        maxUpdatedAt(incomingPalettes),
        remoteProfileUpdatedAt,
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
      if (pending.current) {
        pending.current = false
        window.setTimeout(() => syncNowRef.current(), 0)
      }
    }
  }, [user, mergeTasks, mergeTags, mergePalettes, mergeProfile, clearRetry])

  useEffect(() => {
    syncNowRef.current = () => {
      void syncNow()
    }
  }, [syncNow])

  useEffect(() => {
    cursor.current = 0
    lastPushed.current = -1
    retryDelay.current = BASE_RETRY_MS
    pending.current = false
    clearRetry()

    if (!user) return undefined

    const active = loadActiveSyncUser()
    if (active && active !== user.id) {
      resetTasks()
      resetTags()
      resetPalettes()
      resetProfile()
      skipPush.current = true
    }
    saveActiveSyncUser(user.id)

    const handle = window.setTimeout(() => void syncNow(), 0)
    return () => window.clearTimeout(handle)
  }, [
    user,
    syncNow,
    resetTasks,
    resetTags,
    resetPalettes,
    resetProfile,
    clearRetry,
  ])

  useEffect(() => {
    if (!user) return undefined
    const handle = window.setTimeout(() => void syncNow(), DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [user, tasks, tags, palettes, profile, syncNow])

  useEffect(() => {
    if (!user) return undefined
    const onFocus = () => void syncNow()
    const onOnline = () => void syncNow()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void syncNow()
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVisibility)

    let timer = 0
    const schedule = () => {
      const interval =
        document.visibilityState === 'visible' ? VISIBLE_POLL_MS : HIDDEN_POLL_MS
      timer = window.setTimeout(() => {
        void syncNow()
        schedule()
      }, interval)
    }
    schedule()

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVisibility)
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
