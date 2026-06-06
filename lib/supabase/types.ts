export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string;
          key: string;
          email: string;
          created_at: string;
          requests_used: number;
          requests_limit: number;
        };
        Insert: {
          id?: string;
          key: string;
          email: string;
          created_at?: string;
          requests_used?: number;
          requests_limit?: number;
        };
        Update: {
          id?: string;
          key?: string;
          email?: string;
          created_at?: string;
          requests_used?: number;
          requests_limit?: number;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          api_key_id: string;
          endpoint: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          api_key_id: string;
          endpoint: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          api_key_id?: string;
          endpoint?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_logs_api_key_id_fkey";
            columns: ["api_key_id"];
            isOneToOne: false;
            referencedRelation: "api_keys";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_api_key_usage: {
        Args: {
          p_key: string;
          p_endpoint: string;
        };
        Returns: {
          api_key_id: string;
          requests_used: number;
          requests_limit: number;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
