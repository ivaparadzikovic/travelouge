import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePostVoters } from '../../../api/votes'
import type { VoterWithProfile } from '../../../models'
import { Modal } from '../../../components/Modal'
import { Avatar } from '../../../components/Avatar'

interface VoterListProps {
  items: VoterWithProfile[]
}

function VoterList({ items }: VoterListProps) {
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
              <Avatar url={p.avatar_url} name={name} size="w-7 h-7" />
              <span className="text-sm">@{p.username}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

interface VotersModalProps {
  postId: string
  onClose: () => void
}

export default function VotersModal({ postId, onClose }: VotersModalProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError, error } = usePostVoters(postId)

  return (
    <Modal
      onClose={onClose}
      className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-xl"
    >
      <>
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
      </>
    </Modal>
  )
}
