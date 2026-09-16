export interface VersionEntry {
  version: string
  date: string
  highlights: string[]
}

export const VERSIONS: VersionEntry[] = [
  {
    version: '5.0.0',
    date: '2026-09-16',
    highlights: [
      'PWA：可安装到桌面 / 主屏，离线可用',
      '主标题、副标题可点击修改',
      '一键删除所有任务（可恢复）',
      '意见反馈箱',
    ],
  },
  {
    version: '4.0.0',
    date: '2026-09-13',
    highlights: [
      '云同步：任务、标签、自定义配色跨设备同步',
      '逐条 LWW 冲突处理，软删除 / 永久删除墓碑',
      '增量推送与拉取、离线等待、失败退避重试',
      '换账号自动隔离本地数据；账号弹窗显示同步状态',
    ],
  },
  {
    version: '3.0.0',
    date: '2026-09-13',
    highlights: [
      '账号系统（可选登录）：邮箱 + 密码注册 / 登录 / 登出',
      '后端 Hono + Drizzle + PostgreSQL，scrypt 密码哈希、数据库会话 + httpOnly Cookie',
      '不登录仍为纯本地模式，原有功能不受影响',
    ],
  },
  {
    version: '2.0.0',
    date: '2026-09-13',
    highlights: [
      '主题系统：11 套预设 + 跟随系统',
      '自定义主题：19 组推荐配色，双色 / 三色一键应用',
      '自选配色：取色器 + 十六进制输入，实时预览并自动适配对比度',
      '我的配色：保存 / 改名 / 删除；主题弹窗可拖动',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-09-13',
    highlights: [
      '任务新增、编辑、完成、删除，数据保存在本机',
      '标签、搜索与多维筛选、排序与分页',
      '优先级与截止日期（逾期高亮）',
      '回收站、数据统计',
    ],
  },
]

export const CURRENT_VERSION = VERSIONS[0].version
