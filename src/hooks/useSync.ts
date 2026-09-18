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
import { canonicalJson } from '../lib/merge'
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
const BATCH_SIZE = 500

function taskKey(id: string): string {
  return `task:${id}`
}

function tagKey(id: string): string {
  return `tag:${id}`
}

function paletteKey(id: string): string {
  return `palette:${id}`
}

const PROFILE_KEY = 'profile'

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
  const synced = useRef(new Map<string, string>())
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
    setError(null)

    try {
      const snapshot = latest.current
      const snapshots = synced.current

      const isChanged = (key: string, value: unknown): boolean =>
        canonicalJson(value) !== snapshots.get(key)

      const changedTasks = snapshot.tasks.filter((task) =>
        isChanged(taskKey(task.id), task),
      )
      const changedTags = snapshot.tags.filter((tag) =>
        isChanged(tagKey(tag.id), tag),
      )
      const changedPalettes = snapshot.palettes.filter((palette) =>
        isChanged(paletteKey(palette.id), palette),
      )
      const profileChanged = isChanged(PROFILE_KEY, snapshot.profile)
      const hasLocalChanges =
        changedTasks.length > 0 ||
        changedTags.length > 0 ||
        changedPalettes.length > 0 ||
        profileChanged

      const responses: SyncResponse[] = []
      if (!skipPush.current && hasLocalChanges) {
        setStatus('syncing')
        const batchCount = Math.max(
          1,
          Math.ceil(
            Math.max(
              changedTasks.length,
              changedTags.length,
              changedPalettes.length,
            ) / BATCH_SIZE,
          ),
        )

        for (let index = 0; index < batchCount; index += 1) {
          const start = index * BATCH_SIZE
          const batch = {
            tasks: changedTasks.slice(start, start + BATCH_SIZE),
            tags: changedTags.slice(start, start + BATCH_SIZE),
            palettes: changedPalettes.slice(start, start + BATCH_SIZE),
            profile: index === 0 ? snapshot.profile : null,
          }

          const response = await pushSync(batch)
          responses.push(response)

          for (const task of batch.tasks) {
            snapshots.set(taskKey(task.id), canonicalJson(task))
          }
          for (const tag of batch.tags) {
            snapshots.set(tagKey(tag.id), canonicalJson(tag))
          }
          for (const palette of batch.palettes) {
            snapshots.set(paletteKey(palette.id), canonicalJson(palette))
          }
          if (batch.profile) {
            snapshots.set(PROFILE_KEY, canonicalJson(batch.profile))
          }
        }
      }
      skipPush.current = false

      const pulled = await pullSync(cursor.current)
      const incomingTasks = [
        ...responses.flatMap((response) => response.tasks),
        ...pulled.tasks,
      ]
      const incomingTags = [
        ...responses.flatMap((response) => response.tags),
        ...pulled.tags,
      ]
      const incomingPalettes = [
        ...responses.flatMap((response) => response.palettes),
        ...pulled.palettes,
      ]
      const incomingProfiles = [
        ...responses.map((response) => response.profile),
        pulled.profile,
      ]

      mergeTasks(incomingTasks)
      mergeTags(incomingTags)
      mergePalettes(incomingPalettes)
      for (const incoming of incomingProfiles) {
        mergeProfile(incoming)
      }

      for (const task of incomingTasks) {
        snapshots.set(taskKey(task.id), canonicalJson(task))
      }
      for (const tag of incomingTags) {
        snapshots.set(tagKey(tag.id), canonicalJson(tag))
      }
      for (const palette of incomingPalettes) {
        snapshots.set(paletteKey(palette.id), canonicalJson(palette))
      }
      for (const incoming of incomingProfiles) {
        if (incoming) {
          snapshots.set(PROFILE_KEY, canonicalJson(incoming))
        }
      }

      cursor.current = pulled.serverTime

      const didChange =
        hasLocalChanges ||
        incomingTasks.length > 0 ||
        incomingTags.length > 0 ||
        incomingPalettes.length > 0 ||
        incomingProfiles.some((incoming) => incoming !== null)

      retryDelay.current = BASE_RETRY_MS
      clearRetry()
      if (didChange) setLastSyncedAt(Date.now())
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
    synced.current.clear()
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
