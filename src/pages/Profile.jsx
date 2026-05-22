import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useProfile, useUpdateProfile, useUploadAvatar, useRemoveAvatar } from '../hooks/useProfile'
import { useUserPosts } from '../hooks/usePosts'
import { useAuthStore } from '../stores/authStore'
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

export default function Profile() {
  const { id } = useParams()
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile(id)
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
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
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
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    {t('profile.removeAvatar')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{t('profile.reputation')}: <strong>{profile.reputation}</strong></span>
          <span>{t('profile.posts')}: <strong>{posts?.length || 0}</strong></span>
        </div>

        {profile.bio && !editing && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
        )}

        {profile.user_badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.user_badges.map((ub) => {
              const icon = ub.badges?.icon
              const name = t(`profile.badges.${icon}.name`, { defaultValue: ub.badges?.name })
              const description = t(`profile.badges.${icon}.description`, {
                defaultValue: ub.badges?.description,
              })
              return (
                <span
                  key={ub.badge_id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded"
                  title={description}
                >
                  {BADGE_EMOJI[icon] && <span aria-hidden="true">{BADGE_EMOJI[icon]}</span>}
                  <span>{name}</span>
                </span>
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
            <div>
              <label className="block text-sm font-medium mb-1">{t('profile.displayName')}</label>
              <input
                {...register('display_name')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('profile.bio')}</label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
        <h2 className="text-xl font-bold mb-4">{t('profile.posts')}</h2>
        {posts?.length === 0 && <p className="text-gray-500">{t('profile.noPostsYet')}</p>}
        {posts?.map((post) => (
          <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 py-3">
            <Link to={`/post/${post.id}`} className="text-blue-600 hover:underline font-medium">
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
      </div>
    </div>
  )
}
