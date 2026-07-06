import type { Tables } from './database.types'

export type Vote = Tables<'votes'>

export type VoterWithProfile = Pick<Tables<'votes'>, 'value' | 'created_at'> & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
}
