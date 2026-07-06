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
      <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <span className="pb-2 border-b-2 border-teal-600 text-teal-600 font-medium">
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
