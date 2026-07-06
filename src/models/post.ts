import type { Tables } from './database.types'

export type Post = Tables<'posts'>

export type PostWithRelations = Tables<'posts'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'> | null
  countries: Pick<Tables<'countries'>, 'name' | 'code'> | null
  categories: Pick<Tables<'categories'>, 'name' | 'slug'> | null
}

export type PostWithCountryAndCategory = Tables<'posts'> & {
  countries: Pick<Tables<'countries'>, 'name' | 'code'> | null
  categories: Pick<Tables<'categories'>, 'name' | 'slug'> | null
}
