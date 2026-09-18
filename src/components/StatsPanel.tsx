import { useState } from 'react'
import type { Tag, Task } from '../types'
import { matchesDateFilter } from '../lib/date'
import { getTagPalette } from '../lib/tags'
import { Modal } from './Modal'

interface StatsPanelProps {
  tasks: Task[]
  tags: Tag[]
  onClose: () => void
}

export function StatsPanel({ tasks, tags, onClose }: StatsPanelProps) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)

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
    <Modal
      label="数据统计"
      onClose={onClose}
      size="lg"
      header={
        <>
          <h2 className="text-base font-semibold text-ink">数据统计</h2>
          <p className="mt-0.5 text-xs text-ink-soft">按标签维度查看</p>
        </>
      }
    >
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
            <StatCard label="任务总数" value={total} accent="var(--color-ink-soft)" />
            <StatCard
              label="已完成"
              value={completed}
              accent="var(--color-sage-text)"
            />
            <StatCard label="今日到期" value={dueToday} accent="var(--color-gold)" />
            <StatCard label="逾期" value={overdue} accent="#c25b5b" />
          </div>

          <p className="mt-4 text-center text-[11px] text-ink-soft/70">
            统计不含回收站，不受搜索与筛选影响
          </p>
    </Modal>
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
      : { backgroundColor: 'var(--color-gold)', color: 'var(--color-on-accent)', borderColor: 'var(--color-gold)' }
    : {
        backgroundColor: 'var(--color-chip)',
        color: 'var(--color-chip-text)',
        borderColor: 'var(--color-chip-line)',
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
          stroke="var(--color-chip-line)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-gold)"
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
    <div className="rounded-2xl border border-line bg-surface px-3 py-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}
