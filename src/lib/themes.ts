export type ModeId = 'minimal' | 'anime' | 'guofeng'

export type ThemeId =
  | 'fresh'
  | 'dark'
  | 'songlv'
  | 'bishan'
  | 'tianshuibi'
  | 'xiaowu'
  | 'tuihong'
  | 'taoyao'
  | 'qiubo'
  | 'qianyun'
  | 'mingyue'
  | 'violet'
  | 'qingdai'
  | 'yanzhi'
  | 't486'
  | 'silverelf'
  | 'younv'
  | 'redoni'
  | 'blueoni'
  | 'greed'
  | 'sunprincess'
  | 'songmo'
  | 'fox'
  | 't6154'
  | 'jiahu'
  | 'god'
  | 'custom'
  | 'system'

export type ResolvedTheme = Exclude<ThemeId, 'system'>

export interface Mode {
  id: ModeId
  name: string
  description: string
}

export interface ThemeOption {
  id: ThemeId
  name: string
  description: string
  swatches: string[]
  mode?: ModeId
  locked?: boolean
}

export const MODE_IDS: ModeId[] = ['minimal', 'anime', 'guofeng']

export const MODES: Mode[] = [
  {
    id: 'minimal',
    name: '极简',
    description: '清新治愈的基础配色',
  },
  {
    id: 'anime',
    name: '二次元',
    description: '角色灵感配色，安全命名',
  },
  {
    id: 'guofeng',
    name: '国风',
    description: '东方传统色与器物意象',
  },
]

export const THEME_IDS: ThemeId[] = [
  'fresh',
  'dark',
  'songlv',
  'bishan',
  'tianshuibi',
  'xiaowu',
  'tuihong',
  'taoyao',
  'qiubo',
  'qianyun',
  'mingyue',
  'violet',
  'qingdai',
  'yanzhi',
  't486',
  'silverelf',
  'younv',
  'redoni',
  'blueoni',
  'greed',
  'sunprincess',
  'songmo',
  'fox',
  't6154',
  'jiahu',
  'god',
  'custom',
  'system',
]

export const THEMES: ThemeOption[] = [
  {
    id: 'fresh',
    name: '清新',
    description: '暖金与暖绿，柔和通透',
    swatches: ['#fbf7ef', '#d9a441', '#a9c3a1'],
    mode: 'minimal',
  },
  {
    id: 'dark',
    name: '暗色',
    description: '低饱和暖夜，护眼不刺眼',
    swatches: ['#1f1d1a', '#e0b055', '#8fae88'],
    mode: 'minimal',
  },
  {
    id: 'songlv',
    name: '松绿',
    description: '暖棕松林，苍绿为引',
    swatches: ['#C29E64', '#4C7543'],
    mode: 'minimal',
  },
  {
    id: 'bishan',
    name: '碧山',
    description: '素白宣纸，青绿相映',
    swatches: ['#FAF8F4', '#8BAF56'],
    mode: 'minimal',
  },
  {
    id: 'tianshuibi',
    name: '天水碧',
    description: '凝脂初雪，碧水微澜',
    swatches: ['#F7F3EB', '#5BA5B2'],
    mode: 'minimal',
  },
  {
    id: 'xiaowu',
    name: '小雾',
    description: '雾青蓝绿，清透柔和',
    swatches: ['#eef4f2', '#7aa9a4', '#8fae9c'],
    mode: 'minimal',
  },
  {
    id: 'tuihong',
    name: '退红',
    description: '退红柔粉，西子清蓝',
    swatches: ['#F1D9E8', '#A2CFD5'],
    mode: 'minimal',
  },
  {
    id: 'taoyao',
    name: '桃夭',
    description: '桃夭粉黛，桔梗紫韵',
    swatches: ['#F8CED7', '#6966B6'],
    mode: 'minimal',
  },
  {
    id: 'qiubo',
    name: '秋波蓝',
    description: '秋波蓝影，若竹清风',
    swatches: ['#A5CCDC', '#84BB9F'],
    mode: 'minimal',
  },
  {
    id: 'qianyun',
    name: '浅云',
    description: '浅云素白，东方既白',
    swatches: ['#EDEDF4', '#8EA4CA'],
    mode: 'minimal',
  },
  {
    id: 'mingyue',
    name: '明月珰',
    description: '青灰月光，朱砂点睛',
    swatches: ['#D3D4CD', '#B3392F'],
    mode: 'minimal',
  },
  {
    id: 'violet',
    name: '紫罗兰',
    description: '柔紫薄雾，沉静优雅',
    swatches: ['#BDB5D7', '#7356B1'],
    mode: 'minimal',
  },
  {
    id: 'qingdai',
    name: '青黛',
    description: '靛青染就，青黛含烟',
    swatches: ['#eaeef7', '#56619b', '#708a88'],
    mode: 'guofeng',
  },
  {
    id: 'yanzhi',
    name: '胭脂',
    description: '胭脂薄红，暖玉生香',
    swatches: ['#f7dee1', '#bd4a5b', '#a17a72'],
    mode: 'guofeng',
  },
  {
    id: 't486',
    name: '486',
    description: '浅金与炭灰，清爽利落',
    swatches: ['#575759', '#F1D991', '#FFFFFF'],
    mode: 'anime',
  },
  {
    id: 'silverelf',
    name: '银发精灵',
    description: '银紫微光，清冷通透',
    swatches: ['#E4E4E3', '#D7A9F8', '#9684A1'],
    mode: 'anime',
  },
  {
    id: 'younv',
    name: '幼女',
    description: '莓粉与奶白，柔甜轻盈',
    swatches: ['#F75089', '#FEFEEC', '#FBB5E1'],
    mode: 'anime',
  },
  {
    id: 'redoni',
    name: '红鬼',
    description: '绯粉与紫红，娇俏灵动',
    swatches: ['#F5F5F3', '#FFADC5', '#C876B5'],
    mode: 'anime',
  },
  {
    id: 'blueoni',
    name: '青鬼',
    description: '天蓝与藤紫，清透俏皮',
    swatches: ['#F3F3F1', '#78BAF5', '#BE86DA'],
    mode: 'anime',
  },
  {
    id: 'greed',
    name: '强欲',
    description: '青瓷与墨黑，沉静克制',
    swatches: ['#222224', '#FDFFFF', '#5E9D91'],
    mode: 'anime',
  },
  {
    id: 'sunprincess',
    name: '太阳公主',
    description: '烈金与赤红，灼目为王',
    swatches: ['#C92E2D', '#FED975', '#202024'],
    mode: 'anime',
  },
  {
    id: 'songmo',
    name: '松墨',
    description: '松绿与墨蓝，朱砂点睛',
    swatches: ['#354871', '#2A6742', '#982A37'],
    mode: 'anime',
  },
  {
    id: 'fox',
    name: '狐狸',
    description: '淡紫与浅粉，慵懒柔媚',
    swatches: ['#FCD6F8', '#DEAEF4', '#FCF1FD'],
    mode: 'anime',
  },
  {
    id: 't6154',
    name: '6154',
    description: '丁香紫与绛红，明艳反差',
    swatches: ['#FFFFFF', '#CCACF9', '#C24049'],
    mode: 'anime',
  },
  {
    id: 'jiahu',
    name: '加护',
    description: '赤红与浅金，温暖守护',
    swatches: ['#FDFEFE', '#E63C41', '#F6DC80'],
    mode: 'anime',
  },
  {
    id: 'god',
    name: '神',
    description: '薄荷与松绿，珊瑚点缀',
    swatches: ['#8EECB6', '#509465', '#EE7875'],
    mode: 'anime',
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

export function themesForMode(mode: ModeId): ThemeOption[] {
  return THEMES.filter((theme) => theme.mode === undefined || theme.mode === mode)
}

export function themesInMode(mode: ModeId): ThemeOption[] {
  return THEMES.filter((theme) => theme.mode === mode)
}

export function themeMode(themeId: ThemeId): ModeId | null {
  return THEMES.find((theme) => theme.id === themeId)?.mode ?? null
}

export function resolveTheme(id: ThemeId): ResolvedTheme {
  if (id === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'fresh'
  }
  return id
}
