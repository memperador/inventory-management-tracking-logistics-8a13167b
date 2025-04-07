export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          created_at: string
          csi_code: string | null
          gps_tag: string | null
          id: string
          last_maintenance: string | null
          location: string | null
          maintenance_history: Json | null
          name: string
          nec_code: string | null
          next_maintenance: string | null
          status: string | null
          tenant_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          csi_code?: string | null
          gps_tag?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          maintenance_history?: Json | null
          name: string
          nec_code?: string | null
          next_maintenance?: string | null
          status?: string | null
          tenant_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          csi_code?: string | null
          gps_tag?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          maintenance_history?: Json | null
          name?: string
          nec_code?: string | null
          next_maintenance?: string | null
          status?: string | null
          tenant_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_equipment: {
        Row: {
          assigned_date: string
          created_at: string
          equipment_id: string
          id: string
          project_id: string
          removed_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          equipment_id: string
          id?: string
          project_id: string
          removed_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          equipment_id?: string
          id?: string
          project_id?: string
          removed_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          electrical_category: string | null
          end_date: string | null
          geofence_coordinates: Json | null
          id: string
          name: string
          permit_number: string | null
          site_address: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          electrical_category?: string | null
          end_date?: string | null
          geofence_coordinates?: Json | null
          id?: string
          name: string
          permit_number?: string | null
          site_address?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          electrical_category?: string | null
          end_date?: string | null
          geofence_coordinates?: Json | null
          id?: string
          name?: string
          permit_number?: string | null
          site_address?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          company_type: string | null
          country: string | null
          created_at: string
          id: string
          industry_code_preferences: Json | null
          name: string
          onboarding_completed: boolean | null
          state: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tax_id: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry_code_preferences?: Json | null
          name: string
          onboarding_completed?: boolean | null
          state?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tax_id?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry_code_preferences?: Json | null
          name?: string
          onboarding_completed?: boolean | null
          state?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tax_id?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth0_org_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth0_org_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth0_org_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      equipment_analytics: {
        Row: {
          maintenance_count: number | null
          maintenance_overdue_count: number | null
          operational_count: number | null
          out_of_service_count: number | null
          tenant_id: string | null
          total_equipment: number | null
        }
        Relationships: []
      }
      project_analytics: {
        Row: {
          active_projects: number | null
          completed_projects: number | null
          planned_projects: number | null
          tenant_id: string | null
          total_projects: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "operator" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
