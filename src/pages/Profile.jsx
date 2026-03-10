import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { useUserPosts } from '../hooks/usePosts'
import { useAuthStore } from '../stores/authStore'
import { useEffect, useState } from 'react'

export default function Profile() {
  const { id } = useParams()
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile(id)
  const { data: posts } = useUserPosts(id)
  const updateProfile = useUpdateProfile()
  const [editing, setEditing] = useState(false)
  const isOwnProfile = currentUser?.id === id

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
  if (!profile) return <div>User not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
            <p className="text-gray-500">@{profile.username}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Reputation: <strong>{profile.reputation}</strong></span>
          <span>Posts: <strong>{posts?.length || 0}</strong></span>
        </div>

        {profile.bio && !editing && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
        )}

        {profile.user_badges?.length > 0 && (
          <div className="flex gap-2 mb-4">
            {profile.user_badges.map((ub) => (
              <span
                key={ub.badge_id}
                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded"
                title={ub.badges?.description}
              >
                {ub.badges?.name}
              </span>
            ))}
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
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                {...register('display_name')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
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
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        {posts?.length === 0 && <p className="text-gray-500">No posts yet</p>}
        {posts?.map((post) => (
          <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 py-3">
            <a href={`/post/${post.id}`} className="text-blue-600 hover:underline font-medium">
              {post.title}
            </a>
            <div className="text-sm text-gray-500 mt-1">
              {post.categories?.name} · {post.countries?.name} · {post.vote_count} votes
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
