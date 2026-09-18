import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Task } from '../types'
import { loadTasks, saveTasks } from '../lib/storage'
import { mergeById } from '../lib/merge'

export type TaskPatch = Partial<
  Pick<Task, 'title' | 'priority' | 'dueDate' | 'tagIds'>
>

function sameTask(a: Task, b: Task): boolean {
  return (
    a.title === b.title &&
    a.completed === b.completed &&
    a.priority === b.priority &&
    a.dueDate === b.dueDate &&
    a.createdAt === b.createdAt &&
    a.completedAt === b.completedAt &&
    a.deletedAt === b.deletedAt &&
    a.purgedAt === b.purgedAt &&
    a.tagIds.length === b.tagIds.length &&
    a.tagIds.every((id, index) => id === b.tagIds[index])
  )
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback((title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return

    const now = Date.now()
    const task: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      priority: 'none',
      dueDate: null,
      createdAt: now,
      completedAt: null,
      updatedAt: now,
      deletedAt: null,
      purgedAt: null,
      tagIds: [],
    }
    setTasks((prev) => [task, ...prev])
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task
        const completed = !task.completed
        const now = Date.now()
        return {
          ...task,
          completed,
          completedAt: completed ? now : null,
          updatedAt: now,
        }
      }),
    )
  }, [])

  const updateTask = useCallback((id: string, patch: TaskPatch) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task

        const next: Task = { ...task, ...patch }
        if (patch.title !== undefined) {
          const trimmed = next.title.trim()
          if (!trimmed) return task
          next.title = trimmed
        }
        return { ...next, updatedAt: Date.now() }
      }),
    )
  }, [])

  const detachTag = useCallback((tagId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.tagIds.includes(tagId)
          ? {
              ...task,
              tagIds: task.tagIds.filter((id) => id !== tagId),
              updatedAt: Date.now(),
            }
          : task,
      ),
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, deletedAt: now, updatedAt: now }
          : task,
      ),
    )
  }, [])

  const restoreTask = useCallback((id: string) => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, deletedAt: null, purgedAt: null, updatedAt: now }
          : task,
      ),
    )
  }, [])

  const purgeTask = useCallback((id: string) => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, purgedAt: now, updatedAt: now }
          : task,
      ),
    )
  }, [])

  const emptyTrash = useCallback(() => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.deletedAt !== null
          ? { ...task, purgedAt: now, updatedAt: now }
          : task,
      ),
    )
  }, [])

  const deleteAllTasks = useCallback(() => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.deletedAt === null && task.purgedAt === null
          ? { ...task, deletedAt: now, updatedAt: now }
          : task,
      ),
    )
  }, [])

  const resetTasks = useCallback(() => {
    setTasks([])
  }, [])

  const mergeTasks = useCallback((incoming: Task[]) => {
    setTasks((prev) => {
      const existingIds = new Set(prev.map((task) => task.id))
      const filtered = incoming.filter(
        (task) => task.deletedAt === null || existingIds.has(task.id),
      )
      return mergeById(prev, filtered, sameTask)
    })
  }, [])

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.completed === false && task.deletedAt === null && task.purgedAt === null,
      ),
    [tasks],
  )

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.completed === true && task.deletedAt === null && task.purgedAt === null,
      ),
    [tasks],
  )

  const deletedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.deletedAt !== null && task.purgedAt === null)
        .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [tasks],
  )

  return {
    activeTasks,
    completedTasks,
    deletedTasks,
    allTasks: tasks,
    addTask,
    toggleTask,
    updateTask,
    detachTag,
    deleteTask,
    restoreTask,
    purgeTask,
    emptyTrash,
    deleteAllTasks,
    resetTasks,
    mergeTasks,
  }
}
