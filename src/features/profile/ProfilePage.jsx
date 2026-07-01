import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useProfile, useUpdateProfile, useUploadAvatar, useRemoveAvatar } from '../../api/profile'
import { useUserPosts } from '../../api/posts'
import { useBookmarks } from '../../api/bookmarks'
import { useAuthStore } from '../../stores/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
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

const ALL_BADGE_ICONS = ['pencil', 'globe', 'star', 'message-circle', 'award']

export default function Profile() {
  const { id } = useParams()
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile(id)
  useDocumentTitle(profile?.display_name || (profile?.username ? `@${profile.username}` : null))
  const { data: posts } = useUserPosts(id)
  const { data: bookmarks } = useBookmarks(currentUser?.id === id ? id : null)
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const fileInputRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState('posts')
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

  if (isLoading) return <div>{t('common.loading')}</div>
  if (!profile) return <div>{t('profile.userNotFound')}</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            {isOwnProfile && (
              <div className="flex gap-2 mt-2">
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
                  className="text-sm text-teal-600 hover:underline disabled:opacity-50 whitespace-nowrap"
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
                    className="text-sm text-red-600 hover:underline disabled:opacity-50 whitespace-nowrap"
                  >
                    {t('profile.removeAvatar')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span
            tabIndex={0}
            className="relative group focus:outline-none inline-flex items-center gap-1 cursor-help"
            aria-label={t('profile.reputationExplain.title')}
          >
            {t('profile.reputation')}: <strong>{profile.reputation}</strong>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5M12 7.75v.5" />
            </svg>
            <div
              role="tooltip"
              className="pointer-events-none absolute left-0 top-full mt-2 w-72 px-3 py-2 rounded shadow-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20"
            >
              <div className="font-semibold mb-1.5">{t('profile.reputationExplain.title')}</div>
              <ul className="space-y-0.5 font-normal">
                <li>{t('profile.reputationExplain.post')}</li>
                <li>{t('profile.reputationExplain.comment')}</li>
                <li>{t('profile.reputationExplain.upvote')}</li>
                <li>{t('profile.reputationExplain.downvote')}</li>
              </ul>
            </div>
          </span>
          <span>{t('profile.posts')}: <strong>{posts?.length || 0}</strong></span>
        </div>

        {profile.bio && !editing && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
        )}

        {profile.user_badges?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div
              tabIndex={0}
              className="relative group focus:outline-none"
              aria-label={t('profile.badgesLegend')}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 text-gray-500 dark:text-gray-400 cursor-help">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5M12 7.75v.5" />
                </svg>
              </span>
              <div
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full mt-2 w-72 px-3 py-2 rounded shadow-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20"
              >
                <div className="font-semibold mb-1.5">{t('profile.badgesLegend')}</div>
                <ul className="space-y-1">
                  {ALL_BADGE_ICONS.map((icon) => (
                    <li key={icon} className="flex gap-2">
                      <span aria-hidden="true" className="shrink-0">{BADGE_EMOJI[icon]}</span>
                      <span>
                        <span className="font-medium">{t(`profile.badges.${icon}.name`)}</span>
                        {' — '}
                        <span className="font-normal">{t(`profile.badges.${icon}.description`)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {profile.user_badges.map((ub) => {
              const icon = ub.badges?.icon
              const name = t(`profile.badges.${icon}.name`, { defaultValue: ub.badges?.name })
              const description = t(`profile.badges.${icon}.description`, {
                defaultValue: ub.badges?.description,
              })
              return (
                <div
                  key={ub.badge_id}
                  tabIndex={0}
                  className="relative group focus:outline-none"
                  aria-label={`${name}: ${description}`}
                >
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded cursor-help">
                    {BADGE_EMOJI[icon] && <span aria-hidden="true">{BADGE_EMOJI[icon]}</span>}
                    <span>{name}</span>
                  </span>
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 px-3 py-2 rounded shadow-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20"
                  >
                    <div className="font-semibold mb-0.5 flex items-center gap-1">
                      {BADGE_EMOJI[icon] && <span aria-hidden="true">{BADGE_EMOJI[icon]}</span>}
                      <span>{name}</span>
                    </div>
                    <div className="font-normal">{description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {isOwnProfile && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('common.edit')} {t('common.profile')}
          </button>
        )}

        {editing && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <Field label={t('profile.displayName')}>
              <input
                {...register('display_name')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
            </Field>
            <Field label={t('profile.bio')}>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
            </Field>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      <div>
        <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setTab('posts')}
            className={
              tab === 'posts'
                ? 'pb-2 border-b-2 border-teal-600 text-teal-600 font-medium'
                : 'pb-2 text-gray-500 hover:text-gray-700'
            }
          >
            {t('profile.posts')}
          </button>
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setTab('saved')}
              className={
                tab === 'saved'
                  ? 'pb-2 border-b-2 border-teal-600 text-teal-600 font-medium'
                  : 'pb-2 text-gray-500 hover:text-gray-700'
              }
            >
              {t('profile.saved')}
            </button>
          )}
        </div>

        {tab === 'posts' && (
          <>
            {posts?.length === 0 && <p className="text-gray-500">{t('profile.noPostsYet')}</p>}
            {posts?.map((post) => (
              <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 py-3">
                <Link to={`/post/${post.id}`} className="text-teal-600 hover:underline font-medium">
                  {post.title}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  {t(`categories.${post.categories?.slug}`, { defaultValue: post.categories?.name })} ·{' '}
                  {t(`countries.${post.countries?.code}`, { defaultValue: post.countries?.name })} ·{' '}
                  <span className="text-green-700 dark:text-green-400">↑ {post.upvote_count}</span>{' '}
                  <span className="text-red-700 dark:text-red-400">↓ {post.downvote_count}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'saved' && isOwnProfile && (
          <>
            {(!bookmarks || bookmarks.length === 0) && (
              <p className="text-gray-500">{t('profile.noSavedYet')}</p>
            )}
            {bookmarks?.map((post) => (
              <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 py-3">
                <Link to={`/post/${post.id}`} className="text-teal-600 hover:underline font-medium">
                  {post.title}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  {t(`categories.${post.categories?.slug}`, { defaultValue: post.categories?.name })} ·{' '}
                  {t(`countries.${post.countries?.code}`, { defaultValue: post.countries?.name })} ·{' '}
                  <span className="text-green-700 dark:text-green-400">↑ {post.upvote_count}</span>{' '}
                  <span className="text-red-700 dark:text-red-400">↓ {post.downvote_count}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
