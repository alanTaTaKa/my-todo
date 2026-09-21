import { useState } from 'react'

interface PreviewTask {
  id: number
  title: string
  completed: boolean
  tag?: string
}

const INITIAL_TASKS: PreviewTask[] = [
  { id: 1, title: '给窗边的绿植浇水', completed: false, tag: '生活' },
  { id: 2, title: '读完手边这本书的三页', completed: false, tag: '学习' },
  { id: 3, title: '午后出门走十分钟', completed: true, tag: '生活' },
]

const TAGS = ['生活', '学习', '工作']

export function AppPreview() {
  const [tasks, setTasks] = useState<PreviewTask[]>(INITIAL_TASKS)
  const [draft, setDraft] = useState('')
  const [nextId, setNextId] = useState(4)
  const [tagIndex, setTagIndex] = useState(0)

  const addTask = () => {
    const title = draft.trim()
    if (!title) return
    setTasks((prev) => [
      ...prev,
      { id: nextId, title, completed: false, tag: TAGS[tagIndex] },
    ])
    setNextId((value) => value + 1)
    setTagIndex((value) => (value + 1) % TAGS.length)
    setDraft('')
  }

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const active = tasks.filter((task) => !task.completed)
  const completed = tasks.filter((task) => task.completed)

  return (
    <div className="rounded-3xl border border-line bg-surface p-4 shadow-[0_30px_80px_-40px_rgba(122,101,60,0.7)] backdrop-blur-xl">
      <div className="mb-3 text-center">
        <p className="text-[10px] tracking-[0.35em] text-ink-soft/70">
          DAILY CALM
        </p>
        <p className="mt-1 text-lg font-semibold text-ink">今日待办</p>
        <p className="text-xs text-ink-soft">一件一件，慢慢来</p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-2.5 py-1.5">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addTask()
          }}
          placeholder="写下一件小事…"
          aria-label="预览：新增任务"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={!draft.trim()}
          className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold text-on-accent transition hover:bg-gold-soft disabled:opacity-40"
          aria-label="预览：添加"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <ul className="mt-3 space-y-0.5">
        {active.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5"
          >
            <Checkbox checked={false} onClick={() => toggleTask(task.id)} />
            <span className="min-w-0 flex-1 truncate text-sm text-ink">
              {task.title}
            </span>
            {task.tag && <TagChip label={task.tag} />}
          </li>
        ))}
      </ul>

      {completed.length > 0 && (
        <div className="mt-2">
          <p className="flex items-center gap-1.5 px-2 pb-1 text-[11px] tracking-wider text-ink-soft/80">
            <span className="size-1.5 rounded-full bg-sage" />
            已完成 · {completed.length}
          </p>
          <ul className="space-y-0.5">
            {completed.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5"
              >
                <Checkbox checked onClick={() => toggleTask(task.id)} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft line-through">
                  {task.title}
                </span>
                {task.tag && <TagChip label={task.tag} />}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-ink-soft/70">
        小样而已，随便玩玩，不会保存
      </p>
    </div>
  )
}

function Checkbox({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      aria-label={checked ? '标记为未完成' : '标记为完成'}
      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition ${
        checked ? 'border-sage bg-sage' : 'border-gold/60 hover:border-gold'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 20 20" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.5 8 14.5 16 5.5" />
        </svg>
      )}
    </button>
  )
}

function TagChip({ label }: { label: string }) {
  return (
    <span
      className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px]"
      style={{
        backgroundColor: 'var(--color-chip)',
        color: 'var(--color-chip-text)',
        borderColor: 'var(--color-chip-line)',
      }}
    >
      {label}
    </span>
  )
}
