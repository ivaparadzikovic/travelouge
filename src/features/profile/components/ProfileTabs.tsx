import { useTranslation } from 'react-i18next'
import { ProfilePostList } from './ProfilePostList'
import type { ProfilePostListItem } from './ProfilePostList'

interface ProfileTabsProps {
  posts: ProfilePostListItem[] | undefined
}

export function ProfileTabs({ posts }: ProfileTabsProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex gap-4 mb-4 border-b border-border">
        <span className="pb-2 border-b-2 border-accent text-accent font-medium">
          {t('profile.posts')}
        </span>
      </div>

      <ProfilePostList
        posts={posts}
        isEmpty={posts?.length === 0}
        emptyMessage={t('profile.noPostsYet')}
      />
    </div>
  )
}
