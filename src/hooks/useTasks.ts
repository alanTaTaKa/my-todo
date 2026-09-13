import { useEffect, useState } from 'react'
import type { Task } from '../types'
import { loadTasks, saveTasks } from '../lib/storage'

export type TaskPatch = Partial<
  Pick<Task, 'title' | 'priority' | 'dueDate' | 'tagIds'>
>

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = (title: string) => {
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
      tagIds: [],
    }
    setTasks((prev) => [task, ...prev])
  }

  const toggleTask = (id: string) => {
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
  }

  const updateTask = (id: string, patch: TaskPatch) => {
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
  }

  const detachTag = (tagId: string) => {
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
  }

  const deleteTask = (id: string) => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, deletedAt: now, updatedAt: now }
          : task,
      ),
    )
  }

  const restoreTask = (id: string) => {
    const now = Date.now()
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, deletedAt: null, updatedAt: now }
          : task,
      ),
    )
  }

  const purgeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const emptyTrash = () => {
    setTasks((prev) => prev.filter((task) => task.deletedAt === null))
  }

  const visible = tasks.filter((task) => task.deletedAt === null)
  const activeTasks = visible.filter((task) => !task.completed)
  const completedTasks = visible.filter((task) => task.completed)

  const deletedTasks = tasks
    .filter((task) => task.deletedAt !== null)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))

  return {
    activeTasks,
    completedTasks,
    deletedTasks,
    addTask,
    toggleTask,
    updateTask,
    detachTag,
    deleteTask,
    restoreTask,
    purgeTask,
    emptyTrash,
  }
}
