export interface BrowsePostsFilters {
  countryId?: number | null
  categoryId?: number | null
  q?: string
}

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (sort: string) => [...postKeys.lists(), { sort }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  user: (userId?: string) => [...postKeys.all, 'user', userId] as const,
  browse: (filters: BrowsePostsFilters) => [...postKeys.all, 'browse', filters] as const,
}

export const commentKeys = {
  all: ['comments'] as const,
  byPost: (postId: string) => [...commentKeys.all, postId] as const,
  list: (postId: string, viewerId?: string | null) =>
    [...commentKeys.byPost(postId), viewerId ?? null] as const,
}

export const voteKeys = {
  all: ['votes'] as const,
  voters: (postId: string) => [...voteKeys.all, 'voters', postId] as const,
  userByPost: (postId: string) => [...voteKeys.all, 'user', postId] as const,
  user: (postId: string, userId?: string) => [...voteKeys.userByPost(postId), userId] as const,
}

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId?: string) => [...profileKeys.all, 'detail', userId] as const,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId?: string) => [...notificationKeys.all, 'list', userId] as const,
  unreadCount: (userId?: string) => [...notificationKeys.all, 'unread', userId] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
}

export const countryKeys = {
  all: ['countries'] as const,
  popular: (limit: number) => [...countryKeys.all, 'popular', limit] as const,
}
