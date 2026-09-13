import type { DateFilter, SortDirection, SortKey, StatusFilter, Tag } from '../types'
import { getTagPalette } from '../lib/tags'

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '未完成' },
  { key: 'completed', label: '已完成' },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'created', label: '创建时间' },
  { key: 'priority', label: '优先级' },
  { key: 'dueDate', label: '截止日期' },
]

const DATE_OPTIONS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今天' },
  { key: 'tomorrow', label: '明天' },
  { key: 'week', label: '近7天' },
  { key: 'overdue', label: '已逾期' },
  { key: 'none', label: '无日期' },
]

interface FilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  status: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  dateFilter: DateFilter
  onDateFilterChange: (value: DateFilter) => void
  tags: Tag[]
  activeTagId: string | null
  onTagChange: (id: string | null) => void
  sortKey: SortKey
  onSortKeyChange: (key: SortKey) => void
  sortDirection: SortDirection
  onToggleSortDirection: () => void
  tagsOpen: boolean
  onToggleTags: () => void
}

export function FilterBar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  dateFilter,
  onDateFilterChange,
  tags,
  activeTagId,
  onTagChange,
  sortKey,
  onSortKeyChange,
  sortDirection,
  onToggleSortDirection,
  tagsOpen,
  onToggleTags,
}: FilterBarProps) {
  return (
    <div className="mt-4 space-y-3">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索任务…"
          aria-label="搜索任务"
          className="w-full rounded-2xl border border-line bg-surface-2 py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-gold-soft focus:bg-surface-strong"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-full bg-surface-2 p-0.5">
          {STATUS_OPTIONS.map((option) => {
            const active = status === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onStatusChange(option.key)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  active
                    ? 'bg-gold text-on-accent shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onToggleTags}
          aria-expanded={tagsOpen}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
            tagsOpen
              ? 'border-gold-soft bg-surface-strong text-ink'
              : 'border-line bg-surface text-ink-soft hover:text-ink'
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" />
            <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
          </svg>
          标签
        </button>
      </div>

      <div className="space-y-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[11px] text-ink-soft/70">标签</span>
            <FilterChip
              active={activeTagId === null}
              onClick={() => onTagChange(null)}
              label="全部"
            />
            {tags.map((tag) => {
              const palette = getTagPalette(tag.color)
              return (
                <FilterChip
                  key={tag.id}
                  active={activeTagId === tag.id}
                  onClick={() =>
                    onTagChange(activeTagId === tag.id ? null : tag.id)
                  }
                  label={tag.name}
                  color={palette}
                />
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 text-[11px] text-ink-soft/70">时间</span>
          {DATE_OPTIONS.map((option) => (
            <FilterChip
              key={option.key}
              active={dateFilter === option.key}
              onClick={() => onDateFilterChange(option.key)}
              label={option.label}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 text-[11px] text-ink-soft/70">排序</span>
          {SORT_OPTIONS.map((option) => (
            <FilterChip
              key={option.key}
              active={sortKey === option.key}
              onClick={() => onSortKeyChange(option.key)}
              label={option.label}
            />
          ))}
          <button
            type="button"
            onClick={onToggleSortDirection}
            aria-label="切换排序方向"
            title={sortDirection === 'asc' ? '当前升序' : '当前降序'}
            className="grid size-6 place-items-center rounded-full border border-line bg-surface text-ink-soft transition hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className={`size-3.5 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

interface FilterChipProps {
  active: boolean
  onClick: () => void
  label: string
  color?: { soft: string; strong: string }
}

function FilterChip({ active, onClick, label, color }: FilterChipProps) {
  const style = active
    ? color
      ? { backgroundColor: color.soft, color: color.strong, borderColor: color.strong }
      : { backgroundColor: 'var(--color-gold)', color: 'var(--color-on-accent)', borderColor: 'var(--color-gold)' }
    : { backgroundColor: 'var(--color-chip)', color: 'var(--color-chip-text)', borderColor: 'var(--color-chip-line)' }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border px-2.5 py-1 text-xs transition"
      style={style}
    >
      {label}
    </button>
  )
}
