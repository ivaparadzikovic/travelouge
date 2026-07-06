// Hand-written Supabase Database type for Phase 0 tooling.
//
// `npx supabase gen types typescript --project-id ihynhvuwmshvqtoyclti` requires
// an authenticated Supabase CLI session (SUPABASE_ACCESS_TOKEN / `supabase login`),
// which is not available in this environment, so this file was written by hand
// from `supabase/migrations/001_*.sql` … `020_*.sql`, cross-checked against the
// columns and RPCs actually referenced under `src/api/**`.
//
// Known drift vs. the tracked migrations (schema exists live but has no matching
// migration file — discovered via grep of src/api/**):
//   - `comments.is_edited` / `comments.updated_at`: read/written by
//     src/api/comments/commentsMutations.js (useUpdateComment) and rendered in
//     CommentsSection.jsx, but no migration adds these columns to `comments`.
//   - `popular_destinations(p_limit int)` RPC: called from
//     src/api/countries/countriesQueries.js (usePopularDestinations), but no
//     migration defines this function.
//   - `posts.image_urls` (string[] | null): read/written by
//     src/api/posts/postImages.ts (postImageList) for the multi-image feature,
//     but no migration adds this column to `posts`.
// All are modeled below to match actual app usage; if a future `gen types` run
// disagrees, trust the live database over this file.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          reputation: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          reputation?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          reputation?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          id: number
          name: string
          code: string
        }
        Insert: {
          id?: number
          name: string
          code: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          body: string
          image_url: string | null
          image_urls: string[] | null
          country_id: number
          category_id: number
          vote_count: number
          comment_count: number
          is_edited: boolean
          created_at: string
          updated_at: string
          upvote_count: number
          downvote_count: number
          view_count: number
          /** Generated column: upvote_count / (upvote_count + downvote_count), 0 when no votes. */
          vote_ratio: number
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          body: string
          image_url?: string | null
          image_urls?: string[] | null
          country_id: number
          category_id: number
          vote_count?: number
          comment_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
          upvote_count?: number
          downvote_count?: number
          view_count?: number
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          body?: string
          image_url?: string | null
          image_urls?: string[] | null
          country_id?: number
          category_id?: number
          vote_count?: number
          comment_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
          upvote_count?: number
          downvote_count?: number
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_country_id_fkey'
            columns: ['country_id']
            isOneToOne: false
            referencedRelation: 'countries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      votes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          value: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          value: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          value?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'votes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
        ]
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          body: string
          created_at: string
          like_count: number
          // Not present in tracked migrations; live column inferred from app usage
          // (useUpdateComment / CommentsSection "edited" badge). See file header.
          is_edited: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          body: string
          created_at?: string
          like_count?: number
          is_edited?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          body?: string
          created_at?: string
          like_count?: number
          is_edited?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comment_likes_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comment_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          /** Check constraint: 'upvote' | 'downvote' | 'comment' (was 'vote' | 'comment' pre-013). */
          type: string
          post_id: string
          actor_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          post_id: string
          actor_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          post_id?: string
          actor_id?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      badges: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          user_id: string
          badge_id: number
          awarded_at: string
        }
        Insert: {
          user_id: string
          badge_id: number
          awarded_at?: string
        }
        Update: {
          user_id?: string
          badge_id?: number
          awarded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_badges_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_badges_badge_id_fkey'
            columns: ['badge_id']
            isOneToOne: false
            referencedRelation: 'badges'
            referencedColumns: ['id']
          },
        ]
      }
      polls: {
        Row: {
          id: string
          post_id: string
          question: string
          is_multiple: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          question: string
          is_multiple?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          question?: string
          is_multiple?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'polls_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          position: number
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          position?: number
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: 'poll_options_poll_id_fkey'
            columns: ['poll_id']
            isOneToOne: false
            referencedRelation: 'polls'
            referencedColumns: ['id']
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'poll_votes_poll_id_fkey'
            columns: ['poll_id']
            isOneToOne: false
            referencedRelation: 'polls'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'poll_votes_option_id_fkey'
            columns: ['option_id']
            isOneToOne: false
            referencedRelation: 'poll_options'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'poll_votes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookmarks_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      // RPCs actually called from src/api/** (grepped for `.rpc(`).
      increment_post_view: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      email_for_username: {
        Args: { p_username: string }
        Returns: string | null
      }
      // Not present in tracked migrations; live function inferred from app usage
      // (src/api/countries/countriesQueries.js). See file header.
      popular_destinations: {
        Args: { p_limit: number }
        Returns: {
          country_id: number
          code: string
          name: string
          post_count: number
        }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']

export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']

export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]

export type Functions<T extends keyof PublicSchema['Functions']> = PublicSchema['Functions'][T]
