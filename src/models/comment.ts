import type { Tables } from './database.types'

export type Comment = Tables<'comments'>

export type CommentWithAuthor = Tables<'comments'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'> | null
}

export type CommentWithLikeStatus = CommentWithAuthor & { liked_by_me: boolean }
