import { Modal } from './Modal'
import { UpgradePrompt } from './UpgradePrompt'

const BENEFITS = [
  '自定义主题：自选配色、命名并保存「我的主题」',
  '二次元 / 国风风格主题推荐',
  '首页标题与副标题自定义',
  '阶段性总结报告（即将推出）',
]

interface UpgradePanelProps {
  isPro: boolean
  canRedeem: boolean
  onRedeem: (code: string) => Promise<void>
  onClose: () => void
}

export function UpgradePanel({
  isPro,
  canRedeem,
  onRedeem,
  onClose,
}: UpgradePanelProps) {
  return (
    <Modal
      label="升级版"
      onClose={onClose}
      size="sm"
      header={
        <div>
          <h2 className="text-base font-semibold text-ink">升级版</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            一次买断，解锁全部个性化能力
          </p>
        </div>
      }
    >
      <ul className="space-y-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-xs text-ink">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <svg viewBox="0 0 20 20" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10.5 8 14.5 16 5.5" />
              </svg>
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
        {isPro ? (
          <p className="text-center text-sm text-ink">已解锁升级版，感谢支持</p>
        ) : (
          <UpgradePrompt
            title="输入兑换码解锁"
            description={
              canRedeem
                ? '购买或参与内测后可获得兑换码'
                : '登录账号后即可输入兑换码解锁'
            }
            canRedeem={canRedeem}
            onRedeem={onRedeem}
          />
        )}
      </div>
    </Modal>
  )
}
