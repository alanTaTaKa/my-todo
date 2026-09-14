import { useState } from 'react'

interface AppHeaderProps {
  title: string
  subtitle: string
  onChange: (patch: { title?: string; subtitle?: string }) => void
}

export function AppHeader({ title, subtitle, onChange }: AppHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <p className="text-xs tracking-[0.35em] text-ink-soft/80">DAILY CALM</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
        <EditableText
          value={title}
          fallback="今日待办"
          ariaLabel="修改主标题"
          maxLength={30}
          onSave={(value) => onChange({ title: value })}
          inputClassName="w-full max-w-xs rounded-xl border border-line bg-surface-2 px-3 py-1 text-center text-2xl font-semibold text-ink outline-none focus:border-gold-soft sm:text-3xl"
          buttonClassName="rounded-lg px-1 transition hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
        />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        <EditableText
          value={subtitle}
          fallback="慢慢来，一件一件完成就好"
          ariaLabel="修改副标题"
          maxLength={60}
          onSave={(value) => onChange({ subtitle: value })}
          inputClassName="w-full max-w-sm rounded-xl border border-line bg-surface-2 px-3 py-1 text-center text-sm text-ink outline-none focus:border-gold-soft"
          buttonClassName="rounded-lg px-1 text-ink-soft transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
        />
      </p>
    </header>
  )
}

interface EditableTextProps {
  value: string
  fallback: string
  ariaLabel: string
  maxLength: number
  onSave: (value: string) => void
  inputClassName: string
  buttonClassName: string
}

function EditableText({
  value,
  fallback,
  ariaLabel,
  maxLength,
  onSave,
  inputClassName,
  buttonClassName,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(value)
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    const next = draft.trim() || fallback
    if (next !== value) onSave(next)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') setEditing(false)
        }}
        maxLength={maxLength}
        aria-label={ariaLabel}
        className={inputClassName}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="点击修改"
      className={buttonClassName}
    >
      {value}
    </button>
  )
}
