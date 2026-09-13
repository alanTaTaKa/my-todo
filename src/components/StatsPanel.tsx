import { useEffect, useState } from 'react'
import type { Tag, Task } from '../types'
import { matchesDateFilter } from '../lib/date'
import { getTagPalette } from '../lib/tags'

interface StatsPanelProps {
  tasks: Task[]
  tags: Tag[]
  onClose: () => void
}

export function StatsPanel({ tasks, tags, onClose }: StatsPanelProps) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const effectiveTagId =
    selectedTagId !== null && tags.some((tag) => tag.id === selectedTagId)
      ? selectedTagId
      : null

  const scope =
    effectiveTagId === null
      ? tasks
      : tasks.filter((task) => task.tagIds.includes(effectiveTagId))

  const total = scope.length
  const completed = scope.filter((task) => task.completed).length
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100)
  const dueToday = scope.filter((task) =>
    matchesDateFilter(task.dueDate, 'today', task.completed),
  ).length
  const overdue = scope.filter((task) =>
    matchesDateFilter(task.dueDate, 'overdue', task.completed),
  ).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="数据统计"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-white/60 bg-cream/95 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.6)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">数据统计</h2>
            <p className="mt-0.5 text-xs text-ink-soft">按标签维度查看</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭统计"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-white/70 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            <TagTab
              active={effectiveTagId === null}
              onClick={() => setSelectedTagId(null)}
              label="全部"
            />
            {tags.map((tag) => {
              const palette = getTagPalette(tag.color)
              return (
                <TagTab
                  key={tag.id}
                  active={effectiveTagId === tag.id}
                  onClick={() => setSelectedTagId(tag.id)}
                  label={tag.name}
                  color={palette}
                />
              )
            })}
          </div>

          <div className="mt-5 flex flex-col items-center">
            <ProgressRing value={rate} />
            <p className="mt-2 text-xs text-ink-soft">完成率</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <StatCard label="任务总数" value={total} accent="#8a7f70" />
            <StatCard label="已完成" value={completed} accent="#5f8a5b" />
            <StatCard label="今日到期" value={dueToday} accent="#b8842a" />
            <StatCard label="逾期" value={overdue} accent="#c25b5b" />
          </div>

          <p className="mt-4 text-center text-[11px] text-ink-soft/70">
            统计不含回收站，不受搜索与筛选影响
          </p>
        </div>
      </div>
    </div>
  )
}

interface TagTabProps {
  active: boolean
  onClick: () => void
  label: string
  color?: { soft: string; strong: string }
}

function TagTab({ active, onClick, label, color }: TagTabProps) {
  const style = active
    ? color
      ? { backgroundColor: color.soft, color: color.strong, borderColor: color.strong }
      : { backgroundColor: '#f3e3c2', color: '#b8842a', borderColor: '#b8842a' }
    : {
        backgroundColor: 'rgba(255,255,255,0.5)',
        color: 'var(--color-ink-soft)',
        borderColor: 'rgba(138,127,112,0.25)',
      }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition"
      style={style}
    >
      {label}
    </button>
  )
}

function ProgressRing({ value }: { value: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative grid size-28 place-items-center">
      <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(138,127,112,0.15)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#d9a441"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute text-2xl font-semibold text-ink">{value}%</span>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  accent: string
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/40 px-3 py-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}
