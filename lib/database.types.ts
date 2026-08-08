export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string;
          default_role: Database["public"]["Enums"]["job_contact_role"] | null;
          display_name: string;
          email: string | null;
          id: string;
          instagram_handle: string | null;
          kind: Database["public"]["Enums"]["contact_kind"];
          notes: string | null;
          organization_name: string | null;
          owner_id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_role?: Database["public"]["Enums"]["job_contact_role"] | null;
          display_name: string;
          email?: string | null;
          id?: string;
          instagram_handle?: string | null;
          kind?: Database["public"]["Enums"]["contact_kind"];
          notes?: string | null;
          organization_name?: string | null;
          owner_id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_role?: Database["public"]["Enums"]["job_contact_role"] | null;
          display_name?: string;
          email?: string | null;
          id?: string;
          instagram_handle?: string | null;
          kind?: Database["public"]["Enums"]["contact_kind"];
          notes?: string | null;
          organization_name?: string | null;
          owner_id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: string;
          category: Database["public"]["Enums"]["expense_category"];
          created_at: string;
          description: string;
          expense_date: string;
          id: string;
          job_id: string;
          notes: string | null;
          owner_id: string;
          updated_at: string;
          vendor_contact_id: string | null;
        };
        Insert: {
          amount: number | string;
          category?: Database["public"]["Enums"]["expense_category"];
          created_at?: string;
          description: string;
          expense_date?: string;
          id?: string;
          job_id: string;
          notes?: string | null;
          owner_id?: string;
          updated_at?: string;
          vendor_contact_id?: string | null;
        };
        Update: {
          amount?: number | string;
          category?: Database["public"]["Enums"]["expense_category"];
          created_at?: string;
          description?: string;
          expense_date?: string;
          id?: string;
          job_id?: string;
          notes?: string | null;
          owner_id?: string;
          updated_at?: string;
          vendor_contact_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_vendor_contact_id_fkey";
            columns: ["vendor_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          }
        ];
      };
      job_contacts: {
        Row: {
          confirmation_status: Database["public"]["Enums"]["confirmation_status"];
          contact_id: string;
          created_at: string;
          fee_amount: string | null;
          fee_status: Database["public"]["Enums"]["fee_payment_status"];
          id: string;
          is_primary: boolean;
          job_id: string;
          notes: string | null;
          owner_id: string;
          role: Database["public"]["Enums"]["job_contact_role"];
          send_reminder: boolean;
          updated_at: string;
        };
        Insert: {
          confirmation_status?: Database["public"]["Enums"]["confirmation_status"];
          contact_id: string;
          created_at?: string;
          fee_amount?: number | string | null;
          fee_status?: Database["public"]["Enums"]["fee_payment_status"];
          id?: string;
          is_primary?: boolean;
          job_id: string;
          notes?: string | null;
          owner_id?: string;
          role?: Database["public"]["Enums"]["job_contact_role"];
          send_reminder?: boolean;
          updated_at?: string;
        };
        Update: {
          confirmation_status?: Database["public"]["Enums"]["confirmation_status"];
          contact_id?: string;
          created_at?: string;
          fee_amount?: number | string | null;
          fee_status?: Database["public"]["Enums"]["fee_payment_status"];
          id?: string;
          is_primary?: boolean;
          job_id?: string;
          notes?: string | null;
          owner_id?: string;
          role?: Database["public"]["Enums"]["job_contact_role"];
          send_reminder?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_contacts_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_financials";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "job_contacts_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      jobs: {
        Row: {
          actual_delivery_date: string | null;
          client_contact_id: string | null;
          concept: string | null;
          created_at: string;
          currency: string;
          delivery_deadline: string | null;
          end_at: string;
          id: string;
          location: string | null;
          notes: string | null;
          owner_id: string;
          shoot_type: Database["public"]["Enums"]["shoot_type"];
          start_at: string;
          status: Database["public"]["Enums"]["job_status"];
          title: string;
          total_price: string;
          updated_at: string;
          workflow_status: Database["public"]["Enums"]["workflow_status"];
        };
        Insert: {
          actual_delivery_date?: string | null;
          client_contact_id?: string | null;
          concept?: string | null;
          created_at?: string;
          currency?: string;
          delivery_deadline?: string | null;
          end_at: string;
          id?: string;
          location?: string | null;
          notes?: string | null;
          owner_id?: string;
          shoot_type?: Database["public"]["Enums"]["shoot_type"];
          start_at: string;
          status?: Database["public"]["Enums"]["job_status"];
          title: string;
          total_price?: number | string;
          updated_at?: string;
          workflow_status?: Database["public"]["Enums"]["workflow_status"];
        };
        Update: {
          actual_delivery_date?: string | null;
          client_contact_id?: string | null;
          concept?: string | null;
          created_at?: string;
          currency?: string;
          delivery_deadline?: string | null;
          end_at?: string;
          id?: string;
          location?: string | null;
          notes?: string | null;
          owner_id?: string;
          shoot_type?: Database["public"]["Enums"]["shoot_type"];
          start_at?: string;
          status?: Database["public"]["Enums"]["job_status"];
          title?: string;
          total_price?: number | string;
          updated_at?: string;
          workflow_status?: Database["public"]["Enums"]["workflow_status"];
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: string;
          created_at: string;
          id: string;
          job_id: string;
          notes: string | null;
          owner_id: string;
          payment_date: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_type: Database["public"]["Enums"]["payment_type"];
          updated_at: string;
        };
        Insert: {
          amount: number | string;
          created_at?: string;
          id?: string;
          job_id: string;
          notes?: string | null;
          owner_id?: string;
          payment_date?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_type?: Database["public"]["Enums"]["payment_type"];
          updated_at?: string;
        };
        Update: {
          amount?: number | string;
          created_at?: string;
          id?: string;
          job_id?: string;
          notes?: string | null;
          owner_id?: string;
          payment_date?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_type?: Database["public"]["Enums"]["payment_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_financials";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "payments_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          business_name: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          business_name?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminder_deliveries: {
        Row: {
          channel: Database["public"]["Enums"]["reminder_channel"];
          created_at: string;
          error_message: string | null;
          id: string;
          owner_id: string;
          payload: Json;
          provider_message_id: string | null;
          reminder_id: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["reminder_status"];
          target_phone: string | null;
        };
        Insert: {
          channel: Database["public"]["Enums"]["reminder_channel"];
          created_at?: string;
          error_message?: string | null;
          id?: string;
          owner_id: string;
          payload?: Json;
          provider_message_id?: string | null;
          reminder_id: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["reminder_status"];
          target_phone?: string | null;
        };
        Update: {
          channel?: Database["public"]["Enums"]["reminder_channel"];
          created_at?: string;
          error_message?: string | null;
          id?: string;
          owner_id?: string;
          payload?: Json;
          provider_message_id?: string | null;
          reminder_id?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["reminder_status"];
          target_phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_deliveries_reminder_id_fkey";
            columns: ["reminder_id"];
            isOneToOne: false;
            referencedRelation: "reminders";
            referencedColumns: ["id"];
          }
        ];
      };
      reminders: {
        Row: {
          channel: Database["public"]["Enums"]["reminder_channel"];
          created_at: string;
          id: string;
          job_id: string;
          last_error: string | null;
          message: string;
          owner_id: string;
          recipient_name: string | null;
          recipient_phone: string | null;
          reminder_type: Database["public"]["Enums"]["reminder_type"];
          scheduled_for: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["reminder_status"];
          target_contact_id: string | null;
          target_type: Database["public"]["Enums"]["reminder_target_type"];
          updated_at: string;
        };
        Insert: {
          channel?: Database["public"]["Enums"]["reminder_channel"];
          created_at?: string;
          id?: string;
          job_id: string;
          last_error?: string | null;
          message: string;
          owner_id?: string;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          reminder_type: Database["public"]["Enums"]["reminder_type"];
          scheduled_for: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["reminder_status"];
          target_contact_id?: string | null;
          target_type?: Database["public"]["Enums"]["reminder_target_type"];
          updated_at?: string;
        };
        Update: {
          channel?: Database["public"]["Enums"]["reminder_channel"];
          created_at?: string;
          id?: string;
          job_id?: string;
          last_error?: string | null;
          message?: string;
          owner_id?: string;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          reminder_type?: Database["public"]["Enums"]["reminder_type"];
          scheduled_for?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["reminder_status"];
          target_contact_id?: string | null;
          target_type?: Database["public"]["Enums"]["reminder_target_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_financials";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "reminders_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminders_target_contact_id_fkey";
            columns: ["target_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      job_financials: {
        Row: {
          actual_delivery_date: string | null;
          assignment_status: string | null;
          client_contact_id: string | null;
          client_name: string | null;
          client_phone: string | null;
          confirmed_photographers: number | null;
          currency: string | null;
          delivery_deadline: string | null;
          end_at: string | null;
          gross_income: string | null;
          job_id: string | null;
          location: string | null;
          net_income: string | null;
          outstanding_balance: string | null;
          owner_id: string | null;
          paid_income: string | null;
          payment_status: string | null;
          shoot_type: Database["public"]["Enums"]["shoot_type"] | null;
          start_at: string | null;
          status: Database["public"]["Enums"]["job_status"] | null;
          title: string | null;
          total_crew_fees: string | null;
          total_expenses: string | null;
          total_photographers: number | null;
          workflow_status: Database["public"]["Enums"]["workflow_status"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      save_job_with_contacts: {
        Args: {
          p_actual_delivery_date?: string | null;
          p_client_contact_id: string | null;
          p_contacts?: Json;
          p_concept: string | null;
          p_currency: string;
          p_delivery_deadline?: string | null;
          p_end_at: string;
          p_job_id: string | null;
          p_location: string | null;
          p_notes: string | null;
          p_shoot_type: Database["public"]["Enums"]["shoot_type"];
          p_start_at: string;
          p_status: Database["public"]["Enums"]["job_status"];
          p_title: string;
          p_total_price: number;
          p_workflow_status?: Database["public"]["Enums"]["workflow_status"];
        };
        Returns: string;
      };
    };
    Enums: {
      confirmation_status: "pending" | "accepted" | "declined" | "tentative";
      contact_kind: "client" | "fg_model" | "crew" | "editor" | "vendor" | "other";
      expense_category:
        | "fg_fee"
        | "crew_fee"
        | "equipment_rental"
        | "transport"
        | "meal"
        | "editing"
        | "studio_rent"
        | "other";
      fee_payment_status: "unpaid" | "paid";
      job_contact_role: "client" | "fg_model" | "crew" | "editor" | "other";
      job_status: "draft" | "confirmed" | "completed" | "delivered" | "cancelled";
      payment_method: "cash" | "bank_transfer" | "ewallet" | "credit_card" | "other";
      payment_type: "dp" | "partial" | "final";
      reminder_channel: "internal" | "whatsapp";
      reminder_status: "pending" | "sent" | "failed" | "cancelled";
      reminder_type: "h_7" | "h_3" | "h_1" | "same_day" | "custom";
      reminder_target_type: "self" | "client" | "fg_model" | "crew" | "custom";
      shoot_type:
        | "portrait"
        | "prewedding"
        | "wedding"
        | "graduation"
        | "brand"
        | "event"
        | "family"
        | "other";
      workflow_status:
        | "scheduled"
        | "shot"
        | "editing"
        | "ready"
        | "delivered";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type Inserts<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type Updates<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
