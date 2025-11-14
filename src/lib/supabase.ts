import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          original_image_url: string
          analyzed_data: any
          status: 'draft' | 'analyzing' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          original_image_url: string
          analyzed_data?: any
          status?: 'draft' | 'analyzing' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          original_image_url?: string
          analyzed_data?: any
          status?: 'draft' | 'analyzing' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      design_suggestions: {
        Row: {
          id: string
          project_id: string
          suggestion_text: string
          items: any[]
          total_estimated_cost: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          suggestion_text: string
          items?: any[]
          total_estimated_cost?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          suggestion_text?: string
          items?: any[]
          total_estimated_cost?: number | null
          created_at?: string
        }
      }
      decoration_items: {
        Row: {
          id: string
          suggestion_id: string
          name: string
          description: string | null
          category: string
          estimated_price: number | null
          store_name: string | null
          store_location: string | null
          store_distance: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          suggestion_id: string
          name: string
          description?: string | null
          category: string
          estimated_price?: number | null
          store_name?: string | null
          store_location?: string | null
          store_distance?: number | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          suggestion_id?: string
          name?: string
          description?: string | null
          category?: string
          estimated_price?: number | null
          store_name?: string | null
          store_location?: string | null
          store_distance?: number | null
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
