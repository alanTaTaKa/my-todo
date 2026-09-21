import { AppPreview } from './AppPreview'
import { ThemeShowcase } from './ThemeShowcase'

const VALUE_PROPS = [
  {
    title: '事情太多，脑子很乱',
    body: '把它们都收进来，按今天该做的顺序，一件一件轻轻划掉。',
  },
  {
    title: '换了手机就丢数据',
    body: '登录后任务、标签、配色自动同步；不登录，也完全能用。',
  },
  {
    title: '工具冷冰冰，提不起劲',
    body: '26 套治愈配色，还有二次元与国风主题，挑个喜欢的再开始。',
  },
]

const FEATURES = [
  { title: '本地优先，离线可用', body: '断网也能打开，数据先存在你自己的浏览器里。' },
  { title: '免费云同步', body: '登录同账号，多设备自动保持一致。' },
  { title: '标签 · 搜索 · 筛选', body: '多条件叠加，想找的事一下就找得到。' },
  { title: '回收站，误删可恢复', body: '删错了也别慌，随时捞回来。' },
  { title: '数据统计，看见坚持', body: '按标签回看完成率与逾期，温柔地提醒你。' },
  { title: '可安装到桌面', body: '像 App 一样独立窗口，随手就能打开。' },
]

const PRO_BENEFITS = [
  '自定义主题：自选配色、命名并保存「我的主题」',
  '二次元 / 国风风格主题推荐',
  '首页标题与副标题自定义',
  '阶段性总结报告（即将推出）',
]

const FAQS = [
  {
    q: '需要注册才能用吗？',
    a: '不需要。打开就能用，数据只留在你的设备上；想要多设备同步时再登录即可。',
  },
  {
    q: '我的数据存在哪里？',
    a: '默认只存在本机浏览器。登录并同步后，数据会存进你自己的账号，用于多设备拉取。',
  },
  {
    q: '换手机了怎么办？',
    a: '在新设备登录同一个账号，任务、标签、自定义配色会自动同步过来。',
  },
  {
    q: '升级版包含什么？',
    a: '一次买断，解锁自定义主题、二次元 / 国风主题、标题副标题自定义，以及后续的阶段报告。云同步始终保持免费。',
  },
  {
    q: '怎么解锁升级版？',
    a: '目前可在应用内输入兑换码解锁，正式支付即将上线。',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gold text-on-accent">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5 10 17.5 19 7" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-ink">今日待办</span>
          </a>
          <nav className="hidden items-center gap-5 text-sm text-ink-soft sm:flex">
            <a href="#features" className="transition hover:text-ink">功能</a>
            <a href="#themes" className="transition hover:text-ink">主题</a>
            <a href="#pro" className="transition hover:text-ink">升级版</a>
          </nav>
          <a
            href="/app"
            className="rounded-full bg-gold px-3.5 py-1.5 text-xs font-medium text-on-accent transition hover:bg-gold-soft"
          >
            立即开始
          </a>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" />
            清新治愈 · 本地优先
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            把日子，
            <br />
            过成慢慢来的样子
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            今日待办是一个温柔的小工具：帮你收好每一件小事，再陪你一件一件完成。不用注册，数据先留在你这里。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/app"
              className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-on-accent transition hover:bg-gold-soft"
            >
              免注册，立即开始
            </a>
            <a
              href="#themes"
              className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm text-ink transition hover:bg-surface-2"
            >
              先看看主题
            </a>
          </div>
          <p className="mt-5 text-xs text-ink-soft/80">
            本地优先 · 离线可用 · 免费云同步 · 可安装到桌面
          </p>
        </div>
        <AppPreview />
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <h3 className="text-sm font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ThemeShowcase />

      <section id="features" className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            该有的都有，但一点也不吵
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            专注在「把事做完」这一件事上
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-sage-soft/60 text-sage">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 10 17.5 19 7" />
                </svg>
              </span>
              <h3 className="mt-3 text-sm font-medium text-ink">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pro" className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
        <div className="rounded-3xl border border-line bg-surface p-6 text-center sm:p-10">
          <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold">
            升级版 · 一次买断
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">
            解锁更多温柔
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            核心功能与云同步永久免费，升级只为更合你心的样子。
          </p>
          <ul className="mx-auto mt-6 grid max-w-md gap-2.5 text-left">
            {PRO_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <svg viewBox="0 0 20 20" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10.5 8 14.5 16 5.5" />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <a
            href="/app"
            className="mt-8 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-on-accent transition hover:bg-gold-soft"
          >
            在应用内解锁
          </a>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
          你可能想问
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-line bg-surface p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink">
                {item.q}
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-ink-soft sm:flex-row">
          <p>© 2026 今日待办 · Daily Calm</p>
          <div className="flex items-center gap-4">
            <span className="cursor-default">隐私政策</span>
            <span className="cursor-default">服务条款</span>
            <a href="/app" className="transition hover:text-ink">进入应用</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
