export interface VersionEntry {
  version: string
  date: string
  highlights: string[]
}

export const VERSIONS: VersionEntry[] = [
  {
    version: '1.0.0',
    date: '2026-09-13',
    highlights: [
      '任务新增、编辑、完成、删除，数据保存在本机',
      '标签：自定义颜色标签，可给任务打标签、按标签筛选',
      '搜索与筛选：关键词搜索，状态、日期、标签多维筛选',
      '排序与分页：按创建时间、优先级、截止日期排序，每页 5/10/20/50 条',
      '优先级与截止日期：四档优先级，截止时间精确到分钟，逾期高亮',
      '回收站：删除任务可恢复或永久删除',
      '数据统计：按标签维度查看完成率与任务概况',
    ],
  },
]

export const CURRENT_VERSION = VERSIONS[0].version
