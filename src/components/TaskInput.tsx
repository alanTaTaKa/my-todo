import { useState, type FormEvent } from 'react'

interface TaskInputProps {
  onAdd: (title: string) => void
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="想做点什么？慢慢写下来…"
        aria-label="新增任务"
        maxLength={200}
        className="min-w-0 flex-1 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[15px] text-ink shadow-inner outline-none transition placeholder:text-ink-soft/70 focus:border-gold-soft focus:bg-surface-strong"
      />
      <button
        type="submit"
        className="shrink-0 rounded-2xl bg-gold px-5 py-3 text-[15px] font-medium text-on-accent shadow-sm transition hover:bg-gold-soft active:scale-95"
      >
        添加
      </button>
    </form>
  )
}
