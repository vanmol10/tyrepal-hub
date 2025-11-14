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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          dealer_id: string
          id: string
          notes: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          dealer_id: string
          id?: string
          notes?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          dealer_id?: string
          id?: string
          notes?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          address: string
          city: string
          closing_time: string | null
          contact_number: string
          created_at: string | null
          dealer_name: string
          email: string | null
          google_map_link: string | null
          id: string
          is_active: boolean | null
          opening_time: string | null
          pincode: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          closing_time?: string | null
          contact_number: string
          created_at?: string | null
          dealer_name: string
          email?: string | null
          google_map_link?: string | null
          id?: string
          is_active?: boolean | null
          opening_time?: string | null
          pincode: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          closing_time?: string | null
          contact_number?: string
          created_at?: string | null
          dealer_name?: string
          email?: string | null
          google_map_link?: string | null
          id?: string
          is_active?: boolean | null
          opening_time?: string | null
          pincode?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          mobile_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          mobile_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          mobile_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          current_kms: number
          id: string
          invoice_url: string | null
          notes: string | null
          service_date: string
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          current_kms: number
          id?: string
          invoice_url?: string | null
          notes?: string | null
          service_date: string
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          current_kms?: number
          id?: string
          invoice_url?: string | null
          notes?: string | null
          service_date?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      tyre_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tyre_purchases: {
        Row: {
          created_at: string | null
          id: string
          kms_at_purchase: number | null
          number_of_tyres: number
          purchase_date: string
          tyre_brand: string
          tyre_serial_number: string | null
          updated_at: string | null
          user_id: string
          vehicle_id: string
          warranty_certificate_url: string | null
          warranty_end_date: string | null
          warranty_start_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kms_at_purchase?: number | null
          number_of_tyres: number
          purchase_date: string
          tyre_brand: string
          tyre_serial_number?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_id: string
          warranty_certificate_url?: string | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kms_at_purchase?: number | null
          number_of_tyres?: number
          purchase_date?: string
          tyre_brand?: string
          tyre_serial_number?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
          warranty_certificate_url?: string | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tyre_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tyre_purchases_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      tyre_recommendations: {
        Row: {
          car_brand: string
          car_model: string
          car_variant: string
          created_at: string | null
          id: string
          price_range_max: number | null
          price_range_min: number | null
          recommended_brands: string[]
          recommended_pattern: string
          recommended_size: string
          updated_at: string | null
          usage_type: Database["public"]["Enums"]["usage_type"]
        }
        Insert: {
          car_brand: string
          car_model: string
          car_variant: string
          created_at?: string | null
          id?: string
          price_range_max?: number | null
          price_range_min?: number | null
          recommended_brands: string[]
          recommended_pattern: string
          recommended_size: string
          updated_at?: string | null
          usage_type: Database["public"]["Enums"]["usage_type"]
        }
        Update: {
          car_brand?: string
          car_model?: string
          car_variant?: string
          created_at?: string | null
          id?: string
          price_range_max?: number | null
          price_range_min?: number | null
          recommended_brands?: string[]
          recommended_pattern?: string
          recommended_size?: string
          updated_at?: string | null
          usage_type?: Database["public"]["Enums"]["usage_type"]
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string | null
          current_kms: number | null
          id: string
          kms_per_day: number | null
          kms_per_month: number | null
          registration_number: string
          updated_at: string | null
          user_id: string
          vehicle_brand: string
          vehicle_model: string
          vehicle_variant: string | null
          vehicle_year: number
        }
        Insert: {
          created_at?: string | null
          current_kms?: number | null
          id?: string
          kms_per_day?: number | null
          kms_per_month?: number | null
          registration_number: string
          updated_at?: string | null
          user_id: string
          vehicle_brand: string
          vehicle_model: string
          vehicle_variant?: string | null
          vehicle_year: number
        }
        Update: {
          created_at?: string | null
          current_kms?: number | null
          id?: string
          kms_per_day?: number | null
          kms_per_month?: number | null
          registration_number?: string
          updated_at?: string | null
          user_id?: string
          vehicle_brand?: string
          vehicle_model?: string
          vehicle_variant?: string | null
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "customer"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      service_type:
        | "wheel_alignment"
        | "wheel_balancing"
        | "tyre_rotation"
        | "nitrogen_filling"
        | "air_pressure_check"
      usage_type: "hilly_area" | "touring" | "sports" | "fuel_efficient"
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
      app_role: ["admin", "customer"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      service_type: [
        "wheel_alignment",
        "wheel_balancing",
        "tyre_rotation",
        "nitrogen_filling",
        "air_pressure_check",
      ],
      usage_type: ["hilly_area", "touring", "sports", "fuel_efficient"],
    },
  },
} as const
