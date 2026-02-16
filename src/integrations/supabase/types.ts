export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          city: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          message: string
          severity: string
          title: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message: string
          severity?: string
          title: string
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      crops: {
        Row: {
          city: string
          created_at: string
          farmer_id: string
          harvest_date: string
          id: string
          quantity_kg: number
          status: string
          updated_at: string
          vegetable_id: string
        }
        Insert: {
          city?: string
          created_at?: string
          farmer_id: string
          harvest_date: string
          id?: string
          quantity_kg: number
          status?: string
          updated_at?: string
          vegetable_id: string
        }
        Update: {
          city?: string
          created_at?: string
          farmer_id?: string
          harvest_date?: string
          id?: string
          quantity_kg?: number
          status?: string
          updated_at?: string
          vegetable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crops_vegetable_id_fkey"
            columns: ["vegetable_id"]
            isOneToOne: false
            referencedRelation: "vegetables"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_config: {
        Row: {
          daily_demand_kg: number
          id: string
          price_per_kg: number
          updated_at: string
          updated_by: string | null
          vegetable_id: string
        }
        Insert: {
          daily_demand_kg?: number
          id?: string
          price_per_kg?: number
          updated_at?: string
          updated_by?: string | null
          vegetable_id: string
        }
        Update: {
          daily_demand_kg?: number
          id?: string
          price_per_kg?: number
          updated_at?: string
          updated_by?: string | null
          vegetable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_config_vegetable_id_fkey"
            columns: ["vegetable_id"]
            isOneToOne: true
            referencedRelation: "vegetables"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          farmer_id: string
          id: string
          message: string
          rating: number | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          farmer_id: string
          id?: string
          message: string
          rating?: number | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          farmer_id?: string
          id?: string
          message?: string
          rating?: number | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vegetables: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          shelf_life_days: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          shelf_life_days?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          shelf_life_days?: number
        }
        Relationships: []
      }
      weather_cache: {
        Row: {
          city: string
          fetched_at: string
          humidity: number | null
          id: string
          temperature: number | null
          weather_condition: string | null
          weather_multiplier: number
          wind_speed: number | null
        }
        Insert: {
          city: string
          fetched_at?: string
          humidity?: number | null
          id?: string
          temperature?: number | null
          weather_condition?: string | null
          weather_multiplier?: number
          wind_speed?: number | null
        }
        Update: {
          city?: string
          fetched_at?: string
          humidity?: number | null
          id?: string
          temperature?: number | null
          weather_condition?: string | null
          weather_multiplier?: number
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "farmer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "farmer"],
    },
  },
} as const
