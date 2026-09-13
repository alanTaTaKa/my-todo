import type { Priority } from '../types'

export interface PriorityStyle {
  key: Priority
  label: string
  short: string
  soft: string
  strong: string
}

export const PRIORITY_OPTIONS: PriorityStyle[] = [
  { key: 'none', label: '无优先级', short: '无', soft: '#ece7dd', strong: '#8a7f70' },
  { key: 'low', label: '低优先级', short: '低', soft: '#dcebda', strong: '#5f8a5b' },
  { key: 'medium', label: '中优先级', short: '中', soft: '#f3e3c2', strong: '#b8842a' },
  { key: 'high', label: '高优先级', short: '高', soft: '#f3dcdc', strong: '#c25b5b' },
]

const PRIORITY_MAP = Object.fromEntries(
  PRIORITY_OPTIONS.map((item) => [item.key, item]),
) as Record<Priority, PriorityStyle>

export function getPriorityStyle(key: Priority): PriorityStyle {
  return PRIORITY_MAP[key] ?? PRIORITY_OPTIONS[0]
}
