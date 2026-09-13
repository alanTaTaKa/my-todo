import { useEffect } from 'react'
import type { Task } from '../types'
import { formatDateTime } from '../lib/date'

interface RecycleBinProps {
  tasks: Task[]
  onClose: () => void
  onRestore: (id: string) => void
  onPurge: (id: string) => void
  onEmpty: () => void
}

export function RecycleBin({
  tasks,
  onClose,
  onRestore,
  onPurge,
  onEmpty,
}: RecycleBinProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handlePurge = (id: string) => {
    if (window.confirm('确定要永久删除这条任务吗？此操作无法撤销。')) {
      onPurge(id)
    }
  }

  const handleEmpty = () => {
    if (window.confirm('确定要清空回收站吗？其中的任务将被永久删除。')) {
      onEmpty()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="回收站"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-line bg-cream/95 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.6)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">回收站</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              {tasks.length > 0 ? `共 ${tasks.length} 条` : '空空如也'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭回收站"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {tasks.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-soft">
              这里还没有被删除的任务
            </p>
          ) : (
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-2xl px-3 py-2.5 transition hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm text-ink-soft line-through">
                      {task.title}
                    </p>
                    {task.deletedAt !== null && (
                      <p className="mt-0.5 text-[11px] text-ink-soft/70">
                        删除于 {formatDateTime(task.deletedAt)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestore(task.id)}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-xs text-ink-soft transition hover:bg-surface-strong hover:text-ink"
                  >
                    恢复
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePurge(task.id)}
                    aria-label={`永久删除 ${task.title}`}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="border-t border-line px-5 py-3 text-right">
            <button
              type="button"
              onClick={handleEmpty}
              className="rounded-xl px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-500/10"
            >
              清空回收站
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
