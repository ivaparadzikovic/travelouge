export const postKeys = {
  all: ['posts'],
  lists: () => [...postKeys.all, 'list'],
  list: (sort) => [...postKeys.lists(), { sort }],
  details: () => [...postKeys.all, 'detail'],
  detail: (id) => [...postKeys.details(), id],
  user: (userId) => [...postKeys.all, 'user', userId],
  browse: (filters) => [...postKeys.all, 'browse', filters],
}

export const commentKeys = {
  all: ['comments'],
  byPost: (postId) => [...commentKeys.all, postId],
  list: (postId, viewerId) => [...commentKeys.byPost(postId), viewerId ?? null],
}

export const voteKeys = {
  all: ['votes'],
  voters: (postId) => [...voteKeys.all, 'voters', postId],
  userByPost: (postId) => [...voteKeys.all, 'user', postId],
  user: (postId, userId) => [...voteKeys.userByPost(postId), userId],
}

export const profileKeys = {
  all: ['profiles'],
  detail: (userId) => [...profileKeys.all, 'detail', userId],
}

export const notificationKeys = {
  all: ['notifications'],
  list: (userId) => [...notificationKeys.all, 'list', userId],
  unreadCount: (userId) => [...notificationKeys.all, 'unread', userId],
}

export const categoryKeys = {
  all: ['categories'],
}

export const countryKeys = {
  all: ['countries'],
  popular: (limit) => [...countryKeys.all, 'popular', limit],
}

export const bookmarkKeys = {
  all: ['bookmarks'],
  list: (userId) => [...bookmarkKeys.all, 'list', userId],
  byPost: (postId, userId) => [...bookmarkKeys.all, 'post', postId, userId],
}
