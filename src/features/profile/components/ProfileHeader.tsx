import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useUpdateProfile } from '../../../api/profile'
import type { ProfileWithBadges } from '../../../models'
import { useAvatarUpload } from '../hooks/useAvatarUpload'
import { ALLOWED_AVATAR_TYPES } from '../constants'
import { Avatar } from '../../../components/Avatar'
import Field from '../../../components/Field'

const BADGE_EMOJI: Record<string, string> = {
  pencil: '✍️',
  globe: '🌍',
  star: '⭐',
  'message-circle': '💬',
  award: '🏆',
}

const ALL_BADGE_ICONS = ['pencil', 'globe', 'star', 'message-circle', 'award']

interface ProfileEditFormValues {
  display_name: string
  bio: string
}

interface ProfileHeaderProps {
  profile: ProfileWithBadges
  isOwnProfile: boolean
  postsCount: number
}

export function ProfileHeader({ profile, isOwnProfile, postsCount }: ProfileHeaderProps) {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()
  const [editing, setEditing] = useState(false)
  const {
    fileInputRef,
    handleAvatarChange,
    handleAvatarRemove,
    isUploading,
    isRemoving,
  } = useAvatarUpload(profile.id, profile.avatar_url)

  const { register, handleSubmit, reset } = useForm<ProfileEditFormValues>()

  useEffect(() => {
    // Don't resync while editing: an avatar upload/remove refetches the profile
    // and would otherwise reset() over the user's unsaved display_name/bio.
    if (!editing) {
      reset({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      })
    }
  }, [profile, reset, editing])

  const onSubmit = (data: ProfileEditFormValues) => {
    updateProfile.mutate({ id: profile.id, ...data }, {
      onSuccess: () => setEditing(false),
    })
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Avatar
          url={profile.avatar_url}
          name={profile.username}
          size="w-16 h-16"
          initialsClassName="text-2xl"
        />
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
                disabled={isUploading || isRemoving}
                className="text-sm text-teal-600 hover:underline disabled:opacity-50 whitespace-nowrap"
              >
                {isUploading
                  ? t('profile.uploadingAvatar')
                  : profile.avatar_url
                    ? t('profile.changeAvatar')
                    : t('profile.uploadAvatar')}
              </button>
              {profile.avatar_url && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={isUploading || isRemoving}
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
        <span>{t('profile.posts')}: <strong>{postsCount}</strong></span>
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
            // icon can be null/undefined (badges is a possibly-null
            // relation), which isn't a valid index into BADGE_EMOJI;
            // resolve to an emoji (or undefined) once up front instead of
            // indexing by a nullable key below.
            const emoji = icon ? BADGE_EMOJI[icon] : undefined
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
                  {emoji && <span aria-hidden="true">{emoji}</span>}
                  <span>{name}</span>
                </span>
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 px-3 py-2 rounded shadow-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20"
                >
                  <div className="font-semibold mb-0.5 flex items-center gap-1">
                    {emoji && <span aria-hidden="true">{emoji}</span>}
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
  )
}
