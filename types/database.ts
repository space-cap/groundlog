export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "ADMIN" | "MANAGER" | "WORKER";
export type TaskRepeatType = "NONE" | "DAILY" | "WEEKLY";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type HandoverStatus = "OPEN" | "RESOLVED";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      sites: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          address: string | null;
          manager_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          address?: string | null;
          manager_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          address?: string | null;
          manager_name?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          site_id: string | null;
          name: string;
          email: string;
          role: UserRole;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          site_id?: string | null;
          name: string;
          email: string;
          role: UserRole;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          site_id?: string | null;
          name?: string;
          email?: string;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          company_id: string;
          site_id: string;
          name: string;
          description: string | null;
          checklist: string[];
          assigned_user_id: string | null;
          repeat_type: TaskRepeatType;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          site_id: string;
          name: string;
          description?: string | null;
          checklist?: string[];
          assigned_user_id?: string | null;
          repeat_type?: TaskRepeatType;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          site_id?: string;
          name?: string;
          description?: string | null;
          checklist?: string[];
          assigned_user_id?: string | null;
          repeat_type?: TaskRepeatType;
          active?: boolean;
          created_at?: string;
        };
      };
      task_logs: {
        Row: {
          id: string;
          company_id: string;
          task_id: string;
          user_id: string;
          work_date: string;
          status: TaskStatus;
          checklist_completed: string[];
          note: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          task_id: string;
          user_id: string;
          work_date?: string;
          status?: TaskStatus;
          checklist_completed?: string[];
          note?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          task_id?: string;
          user_id?: string;
          work_date?: string;
          status?: TaskStatus;
          checklist_completed?: string[];
          note?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          company_id: string;
          task_log_id: string;
          file_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          task_log_id: string;
          file_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          task_log_id?: string;
          file_path?: string;
          created_at?: string;
        };
      };
      handover_notes: {
        Row: {
          id: string;
          company_id: string;
          site_id: string;
          user_id: string;
          title: string;
          content: string;
          photo_paths: string[];
          status: HandoverStatus;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          site_id: string;
          user_id: string;
          title: string;
          content: string;
          photo_paths?: string[];
          status?: HandoverStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          site_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          photo_paths?: string[];
          status?: HandoverStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_auth_company_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_auth_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_daily_task_logs: {
        Args: {
          p_company_id: string;
          p_work_date?: string;
        };
        Returns: number;
      };
    };
  };
}
