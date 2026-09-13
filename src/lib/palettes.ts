export interface CustomPalette {
  id: string
  name: string
  mode: 'dual' | 'tri'
  colors: string[]
}

export const DUAL_PALETTES: CustomPalette[] = [
  { id: 'deep-sea', name: '深海蓝', mode: 'dual', colors: ['#122E8A', '#F5EFEA'] },
  { id: 'charcoal-pink', name: '炭黑粉', mode: 'dual', colors: ['#1A1A1D', '#E6397C'] },
  { id: 'aurora-purple', name: '极光紫', mode: 'dual', colors: ['#9F82FD', '#FBEA03'] },
  { id: 'mist-peach', name: '雾粉桃', mode: 'dual', colors: ['#F1DDDF', '#E72D48'] },
  { id: 'aurora-green', name: '极光绿', mode: 'dual', colors: ['#9F82FD', '#BCFE1A'] },
  { id: 'tea-rat', name: '茶鼠绿', mode: 'dual', colors: ['#0A8066', '#DED3CD'] },
  { id: 'rose-manor', name: '玫瑰庄园', mode: 'dual', colors: ['#D47898', '#F6F3E8'] },
  { id: 'tennis', name: '网球场', mode: 'dual', colors: ['#1E7D5C', '#D9E4B0'] },
  { id: 'opal-green', name: '蛋白石绿', mode: 'dual', colors: ['#58765E', '#1D524A'] },
]

export const TRI_PALETTES: CustomPalette[] = [
  { id: 'lotus', name: '藕荷', mode: 'tri', colors: ['#E1DBE9', '#F5C386', '#9CBCE3'] },
  { id: 'sky', name: '晴空', mode: 'tri', colors: ['#8BBDE0', '#B1CAA2', '#F9A490'] },
  { id: 'olive', name: '橄榄', mode: 'tri', colors: ['#6E8734', '#EEA079', '#F57E91'] },
  { id: 'warm-sand', name: '暖沙', mode: 'tri', colors: ['#F3E4CF', '#B1C69F', '#FA8D55'] },
  { id: 'lime', name: '青柠', mode: 'tri', colors: ['#6EC02D', '#FDF3E8', '#FF9C7F'] },
  { id: 'citrus', name: '柑橘', mode: 'tri', colors: ['#C5D255', '#FF7F74', '#FFD957'] },
  { id: 'peach-summer', name: '桃夏', mode: 'tri', colors: ['#F9D1D7', '#F7CC6F', '#EC6C5C'] },
  { id: 'sunset', name: '落日', mode: 'tri', colors: ['#FFAE8D', '#C3D13C', '#E35A42'] },
  { id: 'grape', name: '紫葡', mode: 'tri', colors: ['#89A92A', '#FCCC66', '#AD4DB9'] },
  { id: 'honey-peach', name: '蜜桃', mode: 'tri', colors: ['#FFC6A3', '#FF736A', '#FFBFC7'] },
]

export const ALL_CUSTOM_PALETTES: CustomPalette[] = [
  ...DUAL_PALETTES,
  ...TRI_PALETTES,
]
