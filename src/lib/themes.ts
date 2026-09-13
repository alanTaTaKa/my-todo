export type ThemeId =
  | 'fresh'
  | 'dark'
  | 'songlv'
  | 'bishan'
  | 'tianshuibi'
  | 'tuihong'
  | 'taoyao'
  | 'qiubo'
  | 'qianyun'
  | 'mingyue'
  | 'violet'
  | 'custom'
  | 'system'

export type ResolvedTheme = Exclude<ThemeId, 'system'>

export interface ThemeOption {
  id: ThemeId
  name: string
  description: string
  swatches: string[]
}

export const THEME_IDS: ThemeId[] = [
  'fresh',
  'dark',
  'songlv',
  'bishan',
  'tianshuibi',
  'tuihong',
  'taoyao',
  'qiubo',
  'qianyun',
  'mingyue',
  'violet',
  'custom',
  'system',
]

export const THEMES: ThemeOption[] = [
  {
    id: 'fresh',
    name: '清新',
    description: '暖金与暖绿，柔和通透',
    swatches: ['#fbf7ef', '#d9a441', '#a9c3a1'],
  },
  {
    id: 'dark',
    name: '暗色',
    description: '低饱和暖夜，护眼不刺眼',
    swatches: ['#1f1d1a', '#e0b055', '#8fae88'],
  },
  {
    id: 'songlv',
    name: '松绿',
    description: '暖棕松林，苍绿为引',
    swatches: ['#C29E64', '#4C7543'],
  },
  {
    id: 'bishan',
    name: '碧山',
    description: '素白宣纸，青绿相映',
    swatches: ['#FAF8F4', '#8BAF56'],
  },
  {
    id: 'tianshuibi',
    name: '天水碧',
    description: '凝脂初雪，碧水微澜',
    swatches: ['#F7F3EB', '#5BA5B2'],
  },
  {
    id: 'tuihong',
    name: '退红',
    description: '退红柔粉，西子清蓝',
    swatches: ['#F1D9E8', '#A2CFD5'],
  },
  {
    id: 'taoyao',
    name: '桃夭',
    description: '桃夭粉黛，桔梗紫韵',
    swatches: ['#F8CED7', '#6966B6'],
  },
  {
    id: 'qiubo',
    name: '秋波蓝',
    description: '秋波蓝影，若竹清风',
    swatches: ['#A5CCDC', '#84BB9F'],
  },
  {
    id: 'qianyun',
    name: '浅云',
    description: '浅云素白，东方既白',
    swatches: ['#EDEDF4', '#8EA4CA'],
  },
  {
    id: 'mingyue',
    name: '明月珰',
    description: '青灰月光，朱砂点睛',
    swatches: ['#D3D4CD', '#B3392F'],
  },
  {
    id: 'violet',
    name: '紫罗兰',
    description: '柔紫薄雾，沉静优雅',
    swatches: ['#BDB5D7', '#7356B1'],
  },
  {
    id: 'system',
    name: '跟随系统',
    description: '随系统深浅色自动切换',
    swatches: ['#fbf7ef', '#1f1d1a', '#d9a441'],
  },
]

export const DEFAULT_THEME: ThemeId = 'fresh'

export const THEME_STORAGE_KEY = 'todo-app:theme'

export function resolveTheme(id: ThemeId): ResolvedTheme {
  if (id === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'fresh'
  }
  return id
}
