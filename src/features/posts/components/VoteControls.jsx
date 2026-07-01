import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../stores/auth'
import { useUserVote, useVote } from '../../../api/votes'
import VotersModal from './VotersModal'

export default function VoteControls({ postId, authorId, upvoteCount, downvoteCount }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: userVote } = useUserVote(postId)
  const vote = useVote()
  const [showVoters, setShowVoters] = useState(false)
  const hasVotes = (upvoteCount ?? 0) + (downvoteCount ?? 0) > 0
  const isAuthor = !!user && user.id === authorId

  const current = userVote?.value ?? 0
  const disabled = !user || isAuthor || vote.isPending

  const cast = (value) => {
    if (!user || isAuthor) return
    vote.mutate({ postId, value })
  }

  const btn =
    'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium tabular-nums transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const upClass =
    current === 1
      ? 'bg-up text-white'
      : 'text-up hover:bg-up/10'
  const downClass =
    current === -1
      ? 'bg-down text-white'
      : 'text-down hover:bg-down/10'

  return (
    <div
      className="inline-flex items-center gap-3 flex-wrap"
      title={!user ? t('vote.signInToVote') : isAuthor ? t('vote.cannotVoteOwnPost') : undefined}
    >
      <div className="inline-flex items-center overflow-hidden rounded-full border border-border bg-surface">
        <button
          type="button"
          onClick={() => cast(1)}
          disabled={disabled}
          aria-label={t('vote.upvote')}
          aria-pressed={current === 1}
          className={`${btn} ${upClass}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 4l8 10h-5v6h-6v-6H4z" />
          </svg>
          <span>{upvoteCount}</span>
        </button>
        <span className="h-4 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          onClick={() => cast(-1)}
          disabled={disabled}
          aria-label={t('vote.downvote')}
          aria-pressed={current === -1}
          className={`${btn} ${downClass}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 20l-8-10h5V4h6v6h5z" />
          </svg>
          <span>{downvoteCount}</span>
        </button>
      </div>
      {hasVotes && (
        <button
          type="button"
          onClick={() => setShowVoters(true)}
          className="text-sm text-accent hover:underline"
        >
          {t('vote.seeVoters')}
        </button>
      )}
      {showVoters && <VotersModal postId={postId} onClose={() => setShowVoters(false)} />}
    </div>
  )
}
