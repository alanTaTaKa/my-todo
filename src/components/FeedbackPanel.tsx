import { useState, type FormEvent } from 'react'
import { submitFeedback } from '../lib/feedback'
import { Modal } from './Modal'

interface FeedbackPanelProps {
  onClose: () => void
}

export function FeedbackPanel({ onClose }: FeedbackPanelProps) {
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return

    const trimmed = content.trim()
    if (!trimmed) {
      setError('请填写反馈内容')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await submitFeedback({ content: trimmed, contact: contact.trim() })
      setSubmitted(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      label="意见反馈"
      onClose={onClose}
      size="md"
      bodyClassName="px-5 py-5"
      header={
        <>
          <h2 className="text-base font-semibold text-ink">意见反馈</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            用起来哪里不顺手？想加点什么？都可以说
          </p>
        </>
      }
    >
      {submitted ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-sage-soft/60">
                <svg viewBox="0 0 24 24" className="size-6 text-sage" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 10 17.5 19 7" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-ink">感谢你的反馈</p>
              <p className="mt-1 text-xs text-ink-soft">
                每一条我都会认真看，慢慢把它变好
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-xl bg-gold px-5 py-2 text-sm font-medium text-on-accent transition hover:bg-gold-soft"
              >
                完成
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-ink-soft">反馈内容</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="写下你的想法…"
                  rows={5}
                  maxLength={2000}
                  required
                  className="w-full resize-y rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-gold-soft focus:bg-surface-strong"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-ink-soft">
                  联系方式（选填）
                </span>
                <input
                  type="text"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="邮箱 / 微信，方便回复你"
                  maxLength={200}
                  className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-gold-soft focus:bg-surface-strong"
                />
              </label>

              {error && (
                <p className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-soft">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-on-accent transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? '提交中…' : '提交反馈'}
              </button>
            </form>
          )}
    </Modal>
  )
}
