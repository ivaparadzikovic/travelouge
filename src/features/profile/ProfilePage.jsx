import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useProfile, useUpdateProfile, useUploadAvatar, useRemoveAvatar } from '../../api/profile'
import { useUserPosts } from '../../api/posts'
import { useAuthStore } from '../../stores/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import PostCard from '../posts/components/PostCard'
import { useEffect, useRef, useState } from 'react'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const BADGE_EMOJI = {
  pencil: '✍️',
  globe: '🌍',
  star: '⭐',
  'message-circle': '💬',
  award: '🏆',
}

// Fixed per-badge accents (independent of the light/dark theme tokens).
const BADGE_STYLE = {
  pencil: 'bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-300',
  globe: 'bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300',
  star: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300',
  'message-circle': 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300',
  award: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300',
}

// Full badge catalog, in display order. Every badge is always shown; the ones
// the user hasn't earned yet render greyed-out with a "how to earn" tooltip.
const BADGE_CATALOG = ['pencil', 'globe', 'star', 'message-circle', 'award']

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function Profile() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile(id)
  useDocumentTitle(profile?.display_name || (profile?.username ? `@${profile.username}` : null))
  const { data: posts } = useUserPosts(id)
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const fileInputRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const isOwnProfile = currentUser?.id === id

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error(t('profile.avatarInvalidType'))
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t('profile.avatarTooLarge'))
      return
    }
    uploadAvatar.mutate(
      { id, file },
      { onSuccess: () => toast.success(t('profile.avatarUpdated')) },
    )
  }

  const handleAvatarRemove = () => {
    removeAvatar.mutate(
      { id, avatar_url: profile?.avatar_url },
      { onSuccess: () => toast.success(t('profile.avatarRemoved')) },
    )
  }

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      })
    }
  }, [profile, reset])

  const onSubmit = (data) => {
    updateProfile.mutate({ id, ...data }, {
      onSuccess: () => setEditing(false),
    })
  }

  if (isLoading) return <div className="text-muted">{t('common.loading')}</div>
  if (!profile) return <div className="text-muted">{t('profile.userNotFound')}</div>

  const joined = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(i18n.language, {
        month: 'short',
        year: 'numeric',
      })
    : null
  const countryCount = new Set(
    (posts ?? []).map((p) => p.countries?.code).filter(Boolean),
  ).size
  const earnedBadgeIcons = new Set(
    (profile.user_badges ?? []).map((ub) => ub.badges?.icon).filter(Boolean),
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-4 flex items-start gap-4">
          <div className="h-[70px] w-[70px] flex-shrink-0 overflow-hidden rounded-full">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-accent font-display text-2xl font-bold uppercase text-accent-ink">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm text-muted">
              @{profile.username}
              {joined && ` · ${t('profile.joined', { date: joined })}`}
            </p>
            {isOwnProfile && (
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept={ALLOWED_AVATAR_TYPES.join(',')}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatar.isPending || removeAvatar.isPending}
                  className="whitespace-nowrap text-accent hover:underline disabled:opacity-50"
                >
                  {uploadAvatar.isPending
                    ? t('profile.uploadingAvatar')
                    : profile.avatar_url
                      ? t('profile.changeAvatar')
                      : t('profile.uploadAvatar')}
                </button>
                {profile.avatar_url && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={uploadAvatar.isPending || removeAvatar.isPending}
                    className="whitespace-nowrap text-down hover:underline disabled:opacity-50"
                  >
                    {t('profile.removeAvatar')}
                  </button>
                )}
              </div>
            )}
          </div>
          {isOwnProfile && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-shrink-0 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold text-ink hover:bg-surface-2 transition-colors"
            >
              {t('common.edit')}
            </button>
          )}
        </div>

        {profile.bio && !editing && (
          <p className="mb-4 text-sm leading-relaxed text-ink">{profile.bio}</p>
        )}

        {/* Stats — reputation · posts · countries */}
        <div className="mb-5 flex items-center gap-5 border-b border-border pb-4">
          <span
            tabIndex={0}
            className="group relative inline-flex cursor-help items-baseline gap-1.5 focus:outline-none"
            aria-label={t('profile.reputationExplain.title')}
          >
            <span className="font-display text-base font-bold text-ink">{profile.reputation}</span>
            <span className="text-xs text-muted">{t('profile.stats.reputation')}</span>
            <div
              role="tooltip"
              className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 rounded-lg bg-ink px-3 py-2 text-xs text-bg opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <div className="mb-1.5 font-semibold">{t('profile.reputationExplain.title')}</div>
              <ul className="space-y-0.5">
                <li>{t('profile.reputationExplain.post')}</li>
                <li>{t('profile.reputationExplain.comment')}</li>
                <li>{t('profile.reputationExplain.upvote')}</li>
                <li>{t('profile.reputationExplain.downvote')}</li>
              </ul>
            </div>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="inline-flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold text-ink">{posts?.length || 0}</span>
            <span className="text-xs text-muted">{t('profile.stats.posts')}</span>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="inline-flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold text-ink">{countryCount}</span>
            <span className="text-xs text-muted">{t('profile.stats.countries')}</span>
          </span>
        </div>

        {/* Badges — the full catalog is always shown; unearned badges render
            greyed-out with a "how to earn" tooltip. */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('profile.badgesLegend')}
          </h2>
          <div className="flex flex-wrap items-start gap-4">
            {BADGE_CATALOG.map((icon) => {
              const earned = earnedBadgeIcons.has(icon)
              const name = t(`profile.badges.${icon}.name`)
              const description = t(`profile.badges.${icon}.description`)
              return (
                <div
                  key={icon}
                  tabIndex={0}
                  className="group relative w-14 text-center focus:outline-none"
                  aria-label={`${name}: ${description}${earned ? '' : ` (${t('profile.badgeLocked')})`}`}
                >
                  <div
                    className={`mx-auto mb-1.5 flex h-12 w-12 items-center justify-center rounded-full text-xl transition ${
                      earned
                        ? BADGE_STYLE[icon] ?? 'bg-accent-soft text-accent'
                        : 'bg-surface-2 text-muted grayscale'
                    }`}
                  >
                    <span aria-hidden="true" className={earned ? '' : 'opacity-40'}>
                      {BADGE_EMOJI[icon] ?? '🏅'}
                    </span>
                  </div>
                  <div
                    className={`text-[10px] font-semibold leading-tight ${
                      earned ? 'text-ink' : 'text-muted'
                    }`}
                  >
                    {name}
                  </div>
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs text-bg opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <div className="mb-0.5 font-semibold">
                      {name}
                      {!earned && <span className="ml-1 font-normal opacity-70">🔒</span>}
                    </div>
                    <div>{description}</div>
                    {!earned && (
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-bg/60">
                        {t('profile.badgeLocked')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {editing && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
            <Field label={t('profile.displayName')}>
              <input {...register('display_name')} className={inputClass} />
            </Field>
            <Field label={t('profile.bio')}>
              <textarea {...register('bio')} rows={3} className={inputClass} />
            </Field>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      <div>
        <div className="mb-4 flex gap-5 border-b border-border">
          <span className="border-b-2 border-accent pb-2.5 text-sm font-semibold text-accent">
            {t('profile.posts')}
          </span>
        </div>

        {posts?.length === 0 && <p className="text-muted">{t('profile.noPostsYet')}</p>}
        <ul className="space-y-2.5">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} showAuthor={false} />
          ))}
        </ul>
      </div>
    </div>
  )
}
