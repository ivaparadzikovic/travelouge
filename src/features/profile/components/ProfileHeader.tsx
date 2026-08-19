import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useUpdateProfile } from '../../../api/profile'
import type { ProfileWithBadges } from '../../../models'
import { useAvatarUpload } from '../hooks/useAvatarUpload'
import { ALLOWED_AVATAR_TYPES } from '../constants'
import { Avatar } from '../../../components/Avatar'
import Field from '../../../components/Field'


const BADGE_ORDER = ['pencil', 'globe', 'star', 'message-circle', 'award'] as const


const BADGE_STYLES: Record<string, { circle: string; label: string }> = {
  pencil: {
    circle: 'border-[#f7c9de] bg-[#fce7f3] text-[#db2777] shadow-[0_5px_12px_-5px_#db277766] dark:border-[#55223a] dark:bg-[#3a1526] dark:text-[#f472b6] dark:shadow-[0_5px_12px_-5px_#f472b666]',
    label: 'text-[#db2777] dark:text-[#f472b6]',
  },
  globe: {
    circle: 'border-[#bde9e2] bg-[#d7f4ef] text-[#0d9488] shadow-[0_5px_12px_-5px_#0d948866] dark:border-[#1c4a47] dark:bg-[#0f3230] dark:text-[#2dd4bf] dark:shadow-[0_5px_12px_-5px_#2dd4bf66]',
    label: 'text-[#0d9488] dark:text-[#2dd4bf]',
  },
  star: {
    circle: 'border-[#f6dfae] bg-[#fdeecf] text-[#d97706] shadow-[0_5px_12px_-5px_#d9770666] dark:border-[#543d1f] dark:bg-[#382713] dark:text-[#fbbf24] dark:shadow-[0_5px_12px_-5px_#fbbf2466]',
    label: 'text-[#d97706] dark:text-[#fbbf24]',
  },
  'message-circle': {
    circle: 'border-[#ccdefb] bg-[#e3edfe] text-[#2563eb] shadow-[0_5px_12px_-5px_#2563eb66] dark:border-[#263e6a] dark:bg-[#172447] dark:text-[#60a5fa] dark:shadow-[0_5px_12px_-5px_#60a5fa66]',
    label: 'text-[#2563eb] dark:text-[#60a5fa]',
  },
  award: {
    circle: 'border-[#bfeacf] bg-[#daf3e6] text-[#059669] shadow-[0_5px_12px_-5px_#05966966] dark:border-[#1e4c33] dark:bg-[#10321f] dark:text-[#34d399] dark:shadow-[0_5px_12px_-5px_#34d39966]',
    label: 'text-[#059669] dark:text-[#34d399]',
  },
}


const tooltipPanelClass =
  'pointer-events-none absolute rounded shadow-lg bg-ink text-surface text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20'


function BadgeIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'pencil':
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      )
    case 'globe':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'star':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2S6 7 6 13a6 6 0 0 0 12 0c0-2.5-1.2-4.3-2.3-5.6-.5 1.2-1.2 1.8-2 2C13.9 6.7 13.4 4.5 12 2Z" />
        </svg>
      )
    case 'message-circle':
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 3.4-11.3A8.38 8.38 0 0 1 21 11.5Z" />
        </svg>
      )
    case 'award':
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    default:
      return null
  }
}

interface ProfileEditFormValues {
  display_name: string
  bio: string
}

interface ProfileHeaderProps {
  profile: ProfileWithBadges
  isOwnProfile: boolean
  postsCount: number
  countriesCount: number
}

export function ProfileHeader({ profile, isOwnProfile, postsCount, countriesCount }: ProfileHeaderProps) {
  const { t, i18n } = useTranslation()
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

    if (!editing) {
      reset({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      })
    }
  }, [profile, reset, editing])

  const onSubmit = (data: ProfileEditFormValues) => {
    updateProfile.mutate({ id: profile.id, ...data }, {
      onSuccess: () => {
        toast.success(t('profile.profileUpdated'))
        setEditing(false)
      },
    })
  }

  const joined = profile.created_at
    ? new Intl.DateTimeFormat(i18n.language, { month: 'short', year: 'numeric' }).format(
        new Date(profile.created_at),
      )
    : null

  const earnedIcons = new Set(
    profile.user_badges.map((ub) => ub.badges?.icon).filter(Boolean),
  )

  return (
    <div className="mb-8">
      {/* Identity row — 70px gradient avatar · name + handle/joined · primary action */}
      <div className="mb-4 flex items-start gap-4">
        <Avatar
          url={profile.avatar_url}
          name={profile.username}
          size="w-[70px] h-[70px]"
          initialsClassName="text-[22px]"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold leading-tight">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-[13px] text-muted">
            @{profile.username}
            {joined && <> · {t('profile.joined', { date: joined })}</>}
          </p>
          {isOwnProfile && (
            <div className="mt-1.5 flex items-center gap-3">
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
                className="text-xs text-accent hover:underline disabled:opacity-50 whitespace-nowrap"
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
                  className="text-xs text-down hover:underline disabled:opacity-50 whitespace-nowrap"
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
            className="shrink-0 self-start rounded-[9px] bg-accent px-[15px] py-2 text-[13px] font-semibold text-accent-ink hover:bg-accent-hover"
          >
            {t('common.edit')} {t('common.profile')}
          </button>
        )}
      </div>

      {/* Bio */}
      {profile.bio && !editing && (
        <p className="mb-4 text-[13px] leading-[1.55] text-ink">{profile.bio}</p>
      )}

      {/* Stats: number (display font) + lowercase label, divided, underlined */}
      <div className="mb-5 flex items-center gap-5 border-b border-border pb-4">
        <span
          tabIndex={0}
          className="group relative flex cursor-help items-baseline gap-1.5 focus:outline-none"
          aria-label={t('profile.reputationExplain.title')}
        >
          <span className="font-display text-base font-bold text-ink">{profile.reputation}</span>
          <span className="text-xs text-muted">{t('profile.stats.reputation', { count: profile.reputation })}</span>
          <div role="tooltip" className={`${tooltipPanelClass} left-0 top-full mt-2 w-72 px-3 py-2`}>
            <div className="mb-1.5 font-semibold">{t('profile.reputationExplain.title')}</div>
            <ul className="space-y-0.5 font-normal">
              <li>{t('profile.reputationExplain.post')}</li>
              <li>{t('profile.reputationExplain.comment')}</li>
              <li>{t('profile.reputationExplain.upvote')}</li>
              <li>{t('profile.reputationExplain.downvote')}</li>
            </ul>
          </div>
        </span>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        <span className="flex items-baseline gap-1.5">
          <span className="font-display text-base font-bold text-ink">{postsCount}</span>
          <span className="text-xs text-muted">{t('profile.stats.posts', { count: postsCount })}</span>
        </span>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        <span className="flex items-baseline gap-1.5">
          <span className="font-display text-base font-bold text-ink">{countriesCount}</span>
          <span className="text-xs text-muted">{t('profile.stats.countries', { count: countriesCount })}</span>
        </span>
      </div>

      {/* Badges the full designed set; earned in color, locked in grey */}
      <div className="mb-5 flex flex-wrap gap-3.5">
        {BADGE_ORDER.map((icon) => {
          const earned = earnedIcons.has(icon)
          const style = BADGE_STYLES[icon]
          const name = t(`profile.badges.${icon}.name`)
          const description = t(`profile.badges.${icon}.description`)
          return (
            <div
              key={icon}
              tabIndex={0}
              className="group relative w-[58px] cursor-help text-center focus:outline-none"
              aria-label={`${name}: ${description}`}
            >
              <span
                className={`mx-auto mb-1.5 flex h-[46px] w-[46px] items-center justify-center rounded-full border ${earned ? style.circle : 'border-border bg-surface-2 text-muted'}`}
              >
                <BadgeIcon icon={icon} />
              </span>
              <div className={`text-[9px] font-semibold leading-[1.2] ${earned ? style.label : 'text-muted'}`}>
                {name}
              </div>
              <div
                role="tooltip"
                className={`${tooltipPanelClass} left-1/2 bottom-full mb-2 -translate-x-1/2 w-56 px-3 py-2`}
              >
                <div className="mb-0.5 font-semibold">{name}</div>
                <div className="font-normal">{description}</div>
                {!earned && (
                  <div className="mt-1 font-normal opacity-70">{t('profile.badgeLocked')}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Field label={t('profile.displayName')}>
            <input
              {...register('display_name')}
              className="w-full px-3 py-2 border border-border rounded bg-surface"
            />
          </Field>
          <Field label={t('profile.bio')}>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded bg-surface"
            />
          </Field>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="px-4 py-2 bg-accent text-accent-ink rounded hover:bg-accent-hover disabled:opacity-50"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-border rounded hover:bg-surface-2"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
