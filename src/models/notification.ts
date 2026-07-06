import type { Tables } from './database.types'

export type Notification = Tables<'notifications'>

export type NotificationWithRelations = Tables<'notifications'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'> | null
  posts: Pick<Tables<'posts'>, 'title'> | null
}
