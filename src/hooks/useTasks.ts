import { useEffect, useState } from 'react'
import type { Task } from '../types'
import { loadTasks, saveTasks } from '../lib/storage'

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
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    setTasks((prev) => [task, ...prev])
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: Date.now() }
          : task,
      ),
    )
  }

  const editTask = (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, title: trimmed, updatedAt: Date.now() }
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

  const visible = tasks.filter((task) => task.deletedAt === null)
  const activeTasks = visible.filter((task) => !task.completed)
  const completedTasks = visible.filter((task) => task.completed)

  return { activeTasks, completedTasks, addTask, toggleTask, editTask, deleteTask }
}
