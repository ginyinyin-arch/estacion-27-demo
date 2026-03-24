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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      estado_local: {
        Row: {
          abierto: boolean
          fecha_vuelta: string | null
          id: string
          motivo_cierre: string | null
          updated_at: string
        }
        Insert: {
          abierto?: boolean
          fecha_vuelta?: string | null
          id?: string
          motivo_cierre?: string | null
          updated_at?: string
        }
        Update: {
          abierto?: boolean
          fecha_vuelta?: string | null
          id?: string
          motivo_cierre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          descripcion_en: string | null
          fecha: string
          hora_inicio: string
          id: string
          imagen_url: string | null
          nombre: string
          nombre_en: string | null
          precio_entrada: number
          requiere_reserva: boolean
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          descripcion_en?: string | null
          fecha: string
          hora_inicio: string
          id?: string
          imagen_url?: string | null
          nombre: string
          nombre_en?: string | null
          precio_entrada?: number
          requiere_reserva?: boolean
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          descripcion_en?: string | null
          fecha?: string
          hora_inicio?: string
          id?: string
          imagen_url?: string | null
          nombre?: string
          nombre_en?: string | null
          precio_entrada?: number
          requiere_reserva?: boolean
        }
        Relationships: []
      }
      galeria: {
        Row: {
          created_at: string
          id: string
          imagen_url: string
          orden: number
        }
        Insert: {
          created_at?: string
          id?: string
          imagen_url: string
          orden?: number
        }
        Update: {
          created_at?: string
          id?: string
          imagen_url?: string
          orden?: number
        }
        Relationships: []
      }
      horarios: {
        Row: {
          cerrado: boolean
          dia: string
          hora_apertura: string
          hora_cierre: string
          id: string
        }
        Insert: {
          cerrado?: boolean
          dia: string
          hora_apertura?: string
          hora_cierre?: string
          id?: string
        }
        Update: {
          cerrado?: boolean
          dia?: string
          hora_apertura?: string
          hora_cierre?: string
          id?: string
        }
        Relationships: []
      }
      menu_del_dia: {
        Row: {
          activo: boolean
          bebida_incluida: boolean
          created_at: string
          entrada: string | null
          entrada_en: string | null
          fecha: string
          id: string
          plato_principal: string
          plato_principal_en: string | null
          postre: string | null
          postre_en: string | null
          precio: number
          valido_hasta_hora: string
        }
        Insert: {
          activo?: boolean
          bebida_incluida?: boolean
          created_at?: string
          entrada?: string | null
          entrada_en?: string | null
          fecha?: string
          id?: string
          plato_principal: string
          plato_principal_en?: string | null
          postre?: string | null
          postre_en?: string | null
          precio: number
          valido_hasta_hora?: string
        }
        Update: {
          activo?: boolean
          bebida_incluida?: boolean
          created_at?: string
          entrada?: string | null
          entrada_en?: string | null
          fecha?: string
          id?: string
          plato_principal?: string
          plato_principal_en?: string | null
          postre?: string | null
          postre_en?: string | null
          precio?: number
          valido_hasta_hora?: string
        }
        Relationships: []
      }
      platos: {
        Row: {
          categoria: string
          created_at: string
          descripcion: string | null
          descripcion_en: string | null
          disponible: boolean
          disponible_hasta: string | null
          id: string
          imagen_url: string | null
          nombre: string
          nombre_en: string | null
          orden: number
          precio: number
        }
        Insert: {
          categoria: string
          created_at?: string
          descripcion?: string | null
          descripcion_en?: string | null
          disponible?: boolean
          disponible_hasta?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          nombre_en?: string | null
          orden?: number
          precio: number
        }
        Update: {
          categoria?: string
          created_at?: string
          descripcion?: string | null
          descripcion_en?: string | null
          disponible?: boolean
          disponible_hasta?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          nombre_en?: string | null
          orden?: number
          precio?: number
        }
        Relationships: []
      }
      promociones: {
        Row: {
          activa: boolean
          created_at: string
          expira_en: string
          id: string
          mensaje: string | null
          plato_id: string
          tipo_descuento: string
          valor_descuento: number
        }
        Insert: {
          activa?: boolean
          created_at?: string
          expira_en: string
          id?: string
          mensaje?: string | null
          plato_id: string
          tipo_descuento: string
          valor_descuento: number
        }
        Update: {
          activa?: boolean
          created_at?: string
          expira_en?: string
          id?: string
          mensaje?: string | null
          plato_id?: string
          tipo_descuento?: string
          valor_descuento?: number
        }
        Relationships: [
          {
            foreignKeyName: "promociones_plato_id_fkey"
            columns: ["plato_id"]
            isOneToOne: false
            referencedRelation: "platos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
