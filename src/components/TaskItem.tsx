import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Priority, Tag, Task } from '../types'
import type { TaskPatch } from '../hooks/useTasks'
import { fromDateTimeInputValue, toDateTimeInputValue } from '../lib/date'
import { PRIORITY_OPTIONS } from '../lib/priority'
import { getTagPalette } from '../lib/tags'
import { TagChip } from './TagChip'
import { PriorityBadge } from './PriorityBadge'
import { DueBadge } from './DueBadge'

interface TaskItemProps {
  task: Task
  tags: Tag[]
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: TaskPatch) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, tags, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [draftTagIds, setDraftTagIds] = useState<string[]>(task.tagIds)
  const [draftPriority, setDraftPriority] = useState<Priority>(task.priority)
  const [draftDue, setDraftDue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const taskTags = task.tagIds.flatMap((id) => {
    const tag = tags.find((item) => item.id === id)
    return tag ? [tag] : []
  })

  const startEditing = () => {
    setDraft(task.title)
    setDraftTagIds(task.tagIds)
    setDraftPriority(task.priority)
    setDraftDue(toDateTimeInputValue(task.dueDate))
    setEditing(true)
  }

  const commit = () => {
    const patch: TaskPatch = {
      priority: draftPriority,
      dueDate: fromDateTimeInputValue(draftDue),
      tagIds: draftTagIds,
    }
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) patch.title = trimmed
    onUpdate(task.id, patch)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(task.title)
    setDraftTagIds(task.tagIds)
    setDraftPriority(task.priority)
    setDraftDue(toDateTimeInputValue(task.dueDate))
    setEditing(false)
  }

  const toggleDraftTag = (id: string) => {
    setDraftTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit()
    if (event.key === 'Escape') cancel()
  }

  const hasMeta = task.priority !== 'none' || task.dueDate !== null || taskTags.length > 0

  return (
    <li className="group rounded-2xl px-3 py-3 transition hover:bg-white/50">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
          aria-pressed={task.completed}
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition ${
            task.completed
              ? 'border-gold bg-gold text-white'
              : 'border-ink-soft/40 bg-white/50 text-transparent hover:border-gold'
          }`}
        >
          <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10.5 8 14.5 16 5.5" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="编辑任务"
                className="w-full rounded-lg border border-gold-soft/70 bg-white/90 px-2 py-1.5 text-[15px] text-ink outline-none"
              />

              <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-ink-soft">优先级</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITY_OPTIONS.map((option) => {
                    const active = draftPriority === option.key
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setDraftPriority(option.key)}
                        aria-pressed={active}
                        className="rounded-full border px-2.5 py-0.5 text-xs transition"
                        style={
                          active
                            ? {
                                backgroundColor: option.soft,
                                color: option.strong,
                                borderColor: option.strong,
                              }
                            : {
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                color: 'var(--color-ink-soft)',
                                borderColor: 'rgba(138,127,112,0.3)',
                              }
                        }
                      >
                        {option.short}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-ink-soft">截止</span>
                <input
                  type="datetime-local"
                  step={60}
                  value={draftDue}
                  onChange={(event) => setDraftDue(event.target.value)}
                  aria-label="截止日期与时间"
                  className="min-w-0 flex-1 rounded-lg border border-white/70 bg-white/80 px-2 py-1 text-xs text-ink outline-none transition focus:border-gold-soft"
                />
                {draftDue && (
                  <button
                    type="button"
                    onClick={() => setDraftDue('')}
                    className="text-xs text-ink-soft transition hover:text-ink"
                  >
                    清除
                  </button>
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 w-10 shrink-0 text-xs text-ink-soft">标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const active = draftTagIds.includes(tag.id)
                      const palette = getTagPalette(tag.color)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleDraftTag(tag.id)}
                          aria-pressed={active}
                          className="rounded-full border px-2 py-0.5 text-xs transition"
                          style={
                            active
                              ? {
                                  backgroundColor: palette.soft,
                                  color: palette.strong,
                                  borderColor: palette.strong,
                                }
                              : {
                                  backgroundColor: 'rgba(255,255,255,0.5)',
                                  color: 'var(--color-ink-soft)',
                                  borderColor: 'rgba(138,127,112,0.3)',
                                }
                          }
                        >
                          {tag.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={commit}
                  className="rounded-lg bg-gold px-3 py-1 text-xs font-medium text-white transition hover:bg-gold-soft"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-lg px-3 py-1 text-xs text-ink-soft transition hover:bg-white/70"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <span
                onDoubleClick={startEditing}
                className={`block break-words text-[15px] ${
                  task.completed ? 'text-ink-soft/70 line-through' : 'text-ink'
                }`}
              >
                {task.title}
              </span>
              {hasMeta && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {task.priority !== 'none' && (
                    <PriorityBadge priority={task.priority} />
                  )}
                  {task.dueDate !== null && (
                    <DueBadge dueDate={task.dueDate} completed={task.completed} />
                  )}
                  {taskTags.map((tag) => (
                    <TagChip key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

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
      </div>
    </li>
  )
}
