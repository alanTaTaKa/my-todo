import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEditing = () => {
    setDraft(task.title)
    setEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) {
      onEdit(task.id, trimmed)
    } else {
      setDraft(task.title)
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(task.title)
    setEditing(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit()
    if (event.key === 'Escape') cancel()
  }

  return (
    <li className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/50">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
        aria-pressed={task.completed}
        className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${
          task.completed
            ? 'border-gold bg-gold text-white'
            : 'border-ink-soft/40 bg-white/50 text-transparent hover:border-gold'
        }`}
      >
        <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.5 8 14.5 16 5.5" />
        </svg>
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          aria-label="编辑任务"
          className="min-w-0 flex-1 rounded-lg border border-gold-soft/70 bg-white/90 px-2 py-1 text-[15px] text-ink outline-none"
        />
      ) : (
        <span
          onDoubleClick={startEditing}
          className={`min-w-0 flex-1 break-words text-[15px] ${
            task.completed ? 'text-ink-soft/70 line-through' : 'text-ink'
          }`}
        >
          {task.title}
        </span>
      )}

      {!editing && (
        <div className="flex shrink-0 items-center gap-1 opacity-60 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={startEditing}
            aria-label="编辑"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-white/70 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label="删除"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-red-500/10 hover:text-red-500"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      )}
    </li>
  )
}
