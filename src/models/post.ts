import type { Tables } from './database.types'

export type Post = Tables<'posts'>

export type PostWithRelations = Tables<'posts'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'> | null
  countries: Pick<Tables<'countries'>, 'name' | 'code'> | null
  categories: Pick<Tables<'categories'>, 'name' | 'slug'> | null
}

// Same as PostWithRelations minus the author profile (used for a user's own
// post list, where the author is implied). Derived so the country/category
// shape can't drift from PostWithRelations.
export type PostWithCountryAndCategory = Omit<PostWithRelations, 'profiles'>
