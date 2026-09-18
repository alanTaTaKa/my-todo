import type { Task } from '../types'
import { formatDateTime } from '../lib/date'
import { Modal } from './Modal'

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
    <Modal
      label="回收站"
      onClose={onClose}
      size="lg"
      bodyClassName="px-3 py-2"
      header={
        <>
          <h2 className="text-base font-semibold text-ink">回收站</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            {tasks.length > 0 ? `共 ${tasks.length} 条` : '空空如也'}
          </p>
        </>
      }
      footer={
        tasks.length > 0 ? (
          <div className="text-right">
            <button
              type="button"
              onClick={handleEmpty}
              className="rounded-xl px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-500/10"
            >
              清空回收站
            </button>
          </div>
        ) : undefined
      }
    >
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
    </Modal>
  )
}
