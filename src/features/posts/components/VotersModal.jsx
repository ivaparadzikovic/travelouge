import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePostVoters } from '../../../api/votes'

function VoterList({ items }) {
  const { t } = useTranslation()
  if (!items.length) {
    return <p className="py-2 text-sm text-muted">{t('vote.noVoters')}</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((v) => {
        const p = v.profiles
        if (!p) return null
        const name = p.display_name || p.username || '?'
        return (
          <li key={p.id}>
            <Link
              to={`/profile/${p.id}`}
              className="flex items-center gap-2 rounded p-1 hover:bg-surface-2 transition-colors"
            >
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {name[0]?.toUpperCase()}
                </span>
              )}
              <span className="text-sm">@{p.username}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function VotersModal({ postId, onClose }) {
  const { t } = useTranslation()
  const { data, isLoading, isError, error } = usePostVoters(postId)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-display font-semibold text-ink">{t('vote.seeVoters')}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('vote.close')}
            className="text-muted hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <p className="text-sm text-muted">{t('common.loading')}</p>}
          {isError && <p className="text-sm text-down">{error.message}</p>}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-2 text-sm font-medium text-up">
                  {t('vote.upvoters')} ({data.upvoters.length})
                </h4>
                <VoterList items={data.upvoters} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-down">
                  {t('vote.downvoters')} ({data.downvoters.length})
                </h4>
                <VoterList items={data.downvoters} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
