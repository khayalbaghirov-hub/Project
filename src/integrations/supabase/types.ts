// Database types for Supabase project zgukqkdfqqdmzuhaktud.
// Regenerate with: npx supabase gen types typescript --project-id zgukqkdfqqdmzuhaktud
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          comment: string
          consent: boolean
          contact: string
          country_city: string
          created_at: string
          id: string
          language: string
          matters_most: string
          name: string
          procedure: string
          timing: string
          would_pay: string
        }
        Insert: {
          comment?: string
          consent: boolean
          contact: string
          country_city: string
          created_at?: string
          id?: string
          language: string
          matters_most: string
          name: string
          procedure: string
          timing: string
          would_pay: string
        }
        Update: {
          comment?: string
          consent?: boolean
          contact?: string
          country_city?: string
          created_at?: string
          id?: string
          language?: string
          matters_most?: string
          name?: string
          procedure?: string
          timing?: string
          would_pay?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
