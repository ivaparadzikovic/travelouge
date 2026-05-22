import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePostVoters } from '../hooks/useVotes'

function VoterList({ items }) {
  const { t } = useTranslation()
  if (!items.length) {
    return <p className="text-sm text-gray-500 py-2">{t('vote.noVoters')}</p>
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
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
            >
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">{t('vote.seeVoters')}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('vote.close')}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
          {isError && <p className="text-sm text-red-500">{error.message}</p>}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  {t('vote.upvoters')} ({data.upvoters.length})
                </h4>
                <VoterList items={data.upvoters} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
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
