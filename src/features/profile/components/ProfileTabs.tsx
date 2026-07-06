import { useTranslation } from 'react-i18next'
import { ProfilePostList } from './ProfilePostList'
import type { PostWithRelations } from '../../../models'

interface ProfileTabsProps {
  posts: PostWithRelations[] | undefined
}

export function ProfileTabs({ posts }: ProfileTabsProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex gap-5 mb-4 border-b border-border">
        <span className="pb-[9px] border-b-2 border-accent text-[13px] font-semibold text-accent">
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
