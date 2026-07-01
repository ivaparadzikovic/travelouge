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

  const baseBtn =
    'inline-flex items-center gap-1 px-2 py-1 rounded border text-sm font-medium tabular-nums transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const upClass =
    current === 1
      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
      : 'text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30'
  const downClass =
    current === -1
      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
      : 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30'

  return (
    <div
      className="inline-flex items-center gap-2 flex-wrap"
      title={!user ? t('vote.signInToVote') : isAuthor ? t('vote.cannotVoteOwnPost') : undefined}
    >
      <button
        type="button"
        onClick={() => cast(1)}
        disabled={disabled}
        aria-label={t('vote.upvote')}
        aria-pressed={current === 1}
        className={`${baseBtn} ${upClass}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 4l8 10h-5v6h-6v-6H4z" />
        </svg>
        <span>{upvoteCount}</span>
      </button>
      <button
        type="button"
        onClick={() => cast(-1)}
        disabled={disabled}
        aria-label={t('vote.downvote')}
        aria-pressed={current === -1}
        className={`${baseBtn} ${downClass}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 20l-8-10h5V4h6v6h5z" />
        </svg>
        <span>{downvoteCount}</span>
      </button>
      {hasVotes && (
        <button
          type="button"
          onClick={() => setShowVoters(true)}
          className="text-sm text-teal-600 hover:underline"
        >
          {t('vote.seeVoters')}
        </button>
      )}
      {showVoters && <VotersModal postId={postId} onClose={() => setShowVoters(false)} />}
    </div>
  )
}
