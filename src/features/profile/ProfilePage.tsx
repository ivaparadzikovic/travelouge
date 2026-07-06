import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../../api/profile'
import { useUserPosts } from '../../api/posts'
import { useAuthStore } from '../../stores/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileTabs } from './components/ProfileTabs'

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile(id)
  useDocumentTitle(profile?.display_name || (profile?.username ? `@${profile.username}` : null))
  const { data: posts } = useUserPosts(id)
  const isOwnProfile = currentUser?.id === id
  const countriesCount = new Set(
    (posts ?? []).map((p) => p.countries?.code).filter(Boolean),
  ).size

  if (isLoading) return <div>{t('common.loading')}</div>
  if (!profile) return <div>{t('profile.userNotFound')}</div>

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        postsCount={posts?.length || 0}
        countriesCount={countriesCount}
      />
      <ProfileTabs posts={posts} />
    </div>
  )
}
