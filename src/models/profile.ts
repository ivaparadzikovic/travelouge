import type { Tables } from './database.types'

export type Profile = Tables<'profiles'>

export type ProfileWithBadges = Tables<'profiles'> & {
  user_badges: (Pick<Tables<'user_badges'>, 'badge_id' | 'awarded_at'> & {
    badges: Pick<Tables<'badges'>, 'name' | 'description' | 'icon'> | null
  })[]
}
