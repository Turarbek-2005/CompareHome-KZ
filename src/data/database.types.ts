// Сгенерировано Supabase (generate_typescript_types). Не редактируйте вручную.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      apartments: {
        Row: {
          area: number
          balcony: boolean | null
          bathrooms: number | null
          ceiling_height: number | null
          collected_at: string | null
          complex_id: string
          finishing: Database["public"]["Enums"]["finishing_type"] | null
          floor: number | null
          floors_total: number | null
          id: string
          is_demo: boolean
          kitchen_area: number | null
          layout: Json | null
          living_area: number | null
          price: number
          price_per_m2: number | null
          rooms: number
          source_url: string | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_no: string | null
        }
        Insert: {
          area: number
          balcony?: boolean | null
          bathrooms?: number | null
          ceiling_height?: number | null
          collected_at?: string | null
          complex_id: string
          finishing?: Database["public"]["Enums"]["finishing_type"] | null
          floor?: number | null
          floors_total?: number | null
          id: string
          is_demo?: boolean
          kitchen_area?: number | null
          layout?: Json | null
          living_area?: number | null
          price: number
          price_per_m2?: number | null
          rooms: number
          source_url?: string | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_no?: string | null
        }
        Update: {
          area?: number
          balcony?: boolean | null
          bathrooms?: number | null
          ceiling_height?: number | null
          collected_at?: string | null
          complex_id?: string
          finishing?: Database["public"]["Enums"]["finishing_type"] | null
          floor?: number | null
          floors_total?: number | null
          id?: string
          is_demo?: boolean
          kitchen_area?: number | null
          layout?: Json | null
          living_area?: number | null
          price?: number
          price_per_m2?: number | null
          rooms?: number
          source_url?: string | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartments_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "complexes"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          id: string
          lat: number
          lng: number
          name: string
          sort: number
        }
        Insert: {
          id: string
          lat: number
          lng: number
          name: string
          sort?: number
        }
        Update: {
          id?: string
          lat?: number
          lng?: number
          name?: string
          sort?: number
        }
        Relationships: []
      }
      city_price_benchmarks: {
        Row: {
          city_id: string
          period: string
          price_per_m2: number
          source_url: string
        }
        Insert: {
          city_id: string
          period: string
          price_per_m2: number
          source_url: string
        }
        Update: {
          city_id?: string
          period?: string
          price_per_m2?: number
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_price_benchmarks_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      complexes: {
        Row: {
          address: string | null
          amenities: string[]
          ceiling_height: number | null
          city_id: string
          collected_at: string | null
          completion_quarter: number | null
          completion_year: number | null
          developer_id: string
          district: string | null
          floors_max: number | null
          floors_min: number | null
          housing_class: Database["public"]["Enums"]["housing_class"] | null
          id: string
          installment: Json | null
          is_demo: boolean
          lat: number | null
          lng: number | null
          name: string
          parking: string | null
          registry_url: string | null
          safety: Database["public"]["Enums"]["safety_status"]
          safety_note: string | null
          sales_url: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["complex_status"]
          wall_material: Database["public"]["Enums"]["wall_material"] | null
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          ceiling_height?: number | null
          city_id: string
          collected_at?: string | null
          completion_quarter?: number | null
          completion_year?: number | null
          developer_id: string
          district?: string | null
          floors_max?: number | null
          floors_min?: number | null
          housing_class?: Database["public"]["Enums"]["housing_class"] | null
          id: string
          installment?: Json | null
          is_demo?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          parking?: string | null
          registry_url?: string | null
          safety?: Database["public"]["Enums"]["safety_status"]
          safety_note?: string | null
          sales_url?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["complex_status"]
          wall_material?: Database["public"]["Enums"]["wall_material"] | null
        }
        Update: {
          address?: string | null
          amenities?: string[]
          ceiling_height?: number | null
          city_id?: string
          collected_at?: string | null
          completion_quarter?: number | null
          completion_year?: number | null
          developer_id?: string
          district?: string | null
          floors_max?: number | null
          floors_min?: number | null
          housing_class?: Database["public"]["Enums"]["housing_class"] | null
          id?: string
          installment?: Json | null
          is_demo?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          parking?: string | null
          registry_url?: string | null
          safety?: Database["public"]["Enums"]["safety_status"]
          safety_note?: string | null
          sales_url?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["complex_status"]
          wall_material?: Database["public"]["Enums"]["wall_material"] | null
        }
        Relationships: [
          {
            foreignKeyName: "complexes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complexes_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          id: string
          license: string | null
          note: string | null
          publisher: string
          retrieved_at: string
          sort: number
          title: string
          url: string
          used_for: string
        }
        Insert: {
          id: string
          license?: string | null
          note?: string | null
          publisher: string
          retrieved_at: string
          sort?: number
          title: string
          url: string
          used_for: string
        }
        Update: {
          id?: string
          license?: string | null
          note?: string | null
          publisher?: string
          retrieved_at?: string
          sort?: number
          title?: string
          url?: string
          used_for?: string
        }
        Relationships: []
      }
      developers: {
        Row: {
          bin: string | null
          completed_count: number | null
          description: string | null
          founded_year: number | null
          id: string
          is_demo: boolean
          name: string
          phone: string | null
          source_url: string | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          bin?: string | null
          completed_count?: number | null
          description?: string | null
          founded_year?: number | null
          id: string
          is_demo?: boolean
          name: string
          phone?: string | null
          source_url?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          bin?: string | null
          completed_count?: number | null
          description?: string | null
          founded_year?: number | null
          id?: string
          is_demo?: boolean
          name?: string
          phone?: string | null
          source_url?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          apartment_id: string | null
          caption: string | null
          collected_at: string
          complex_id: string | null
          credit: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          sort: number
          source_url: string
          thumb_url: string | null
          url: string
        }
        Insert: {
          apartment_id?: string | null
          caption?: string | null
          collected_at: string
          complex_id?: string | null
          credit: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          sort?: number
          source_url: string
          thumb_url?: string | null
          url: string
        }
        Update: {
          apartment_id?: string | null
          caption?: string | null
          collected_at?: string
          complex_id?: string | null
          credit?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          sort?: number
          source_url?: string
          thumb_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartment_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "complexes"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_programs: {
        Row: {
          bank: string
          housing_types: string[]
          id: string
          max_amount_major: number | null
          max_amount_other: number | null
          max_term_years: number
          min_down_payment_pct: number
          name: string
          note: string | null
          rate: number
          rate_note: string | null
          reduced_down_payment_note: string | null
          reduced_down_payment_pct: number | null
          sort: number
          source_url: string
          verified_at: string
        }
        Insert: {
          bank: string
          housing_types?: string[]
          id: string
          max_amount_major?: number | null
          max_amount_other?: number | null
          max_term_years: number
          min_down_payment_pct: number
          name: string
          note?: string | null
          rate: number
          rate_note?: string | null
          reduced_down_payment_note?: string | null
          reduced_down_payment_pct?: number | null
          sort?: number
          source_url: string
          verified_at: string
        }
        Update: {
          bank?: string
          housing_types?: string[]
          id?: string
          max_amount_major?: number | null
          max_amount_other?: number | null
          max_term_years?: number
          min_down_payment_pct?: number
          name?: string
          note?: string | null
          rate?: number
          rate_note?: string | null
          reduced_down_payment_note?: string | null
          reduced_down_payment_pct?: number | null
          sort?: number
          source_url?: string
          verified_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      apartment_cards: {
        Row: {
          area: number | null
          balcony: boolean | null
          bathrooms: number | null
          ceiling_height: number | null
          city_id: string | null
          collected_at: string | null
          completion_quarter: number | null
          completion_year: number | null
          complex_id: string | null
          complex_name: string | null
          complex_status: Database["public"]["Enums"]["complex_status"] | null
          developer_completed_count: number | null
          developer_id: string | null
          developer_name: string | null
          district: string | null
          finishing: Database["public"]["Enums"]["finishing_type"] | null
          floor: number | null
          floors_total: number | null
          housing_class: Database["public"]["Enums"]["housing_class"] | null
          id: string | null
          is_demo: boolean | null
          kitchen_area: number | null
          lat: number | null
          layout: Json | null
          living_area: number | null
          lng: number | null
          price: number | null
          price_per_m2: number | null
          rooms: number | null
          safety: Database["public"]["Enums"]["safety_status"] | null
          source_url: string | null
          status: Database["public"]["Enums"]["unit_status"] | null
          unit_no: string | null
          wall_material: Database["public"]["Enums"]["wall_material"] | null
        }
        Relationships: [
          {
            foreignKeyName: "apartments_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "complexes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complexes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complexes_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      complex_status: "planned" | "construction" | "completed"
      finishing_type: "rough" | "whitebox" | "finished"
      housing_class: "econom" | "comfort" | "business" | "premium"
      media_kind: "plan" | "exterior" | "interior"
      safety_status:
        | "kzhk_guarantee"
        | "akimat_permit"
        | "bank"
        | "completed"
        | "unknown"
      unit_status: "available" | "reserved" | "sold"
      wall_material:
        | "monolith"
        | "monolith_brick"
        | "brick"
        | "panel"
        | "gasblock"
        | "frame"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
