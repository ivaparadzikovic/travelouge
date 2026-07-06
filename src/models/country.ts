import type { Functions, Tables } from './database.types'

export type Country = Tables<'countries'>

export type PopularDestination = Functions<'popular_destinations'>['Returns'][number]
