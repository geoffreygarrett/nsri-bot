import {Point, Polygon} from "geojson"; 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      _permissionsToroles: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_permissionsToroles_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_permissionsToroles_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      buoy_rescue: {
        Row: {
          additional_info: string | null
          city: string | null
          datetime: string | null
          drowning_cause_id: number | null
          id: number
          link: string | null
          max_persons_floated: number | null
          people_assisted: number | null
          pink_buoy_not_used_people: number | null
          place: string | null
          prb_location_number: string | null
          reference_no: string | null
          rescue: string | null
          rescue_buoy_id: string
          rescue_buoys_log_id: string | null
          sponsor: string | null
        }
        Insert: {
          additional_info?: string | null
          city?: string | null
          datetime?: string | null
          drowning_cause_id?: number | null
          id?: number
          link?: string | null
          max_persons_floated?: number | null
          people_assisted?: number | null
          pink_buoy_not_used_people?: number | null
          place?: string | null
          prb_location_number?: string | null
          reference_no?: string | null
          rescue?: string | null
          rescue_buoy_id: string
          rescue_buoys_log_id?: string | null
          sponsor?: string | null
        }
        Update: {
          additional_info?: string | null
          city?: string | null
          datetime?: string | null
          drowning_cause_id?: number | null
          id?: number
          link?: string | null
          max_persons_floated?: number | null
          people_assisted?: number | null
          pink_buoy_not_used_people?: number | null
          place?: string | null
          prb_location_number?: string | null
          reference_no?: string | null
          rescue?: string | null
          rescue_buoy_id?: string
          rescue_buoys_log_id?: string | null
          sponsor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buoy_rescue_drowning_cause_id_fkey"
            columns: ["drowning_cause_id"]
            isOneToOne: false
            referencedRelation: "drowning_cause"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buoy_rescue_rescue_buoy_id_fkey"
            columns: ["rescue_buoy_id"]
            isOneToOne: false
            referencedRelation: "rescue_buoys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buoy_rescue_rescue_buoys_log_id_fkey"
            columns: ["rescue_buoys_log_id"]
            isOneToOne: false
            referencedRelation: "rescue_buoys_logs"
            referencedColumns: ["id"]
          }
        ]
      }
      drowning_cause: {
        Row: {
          cause: string
          id: number
        }
        Insert: {
          cause: string
          id?: number
        }
        Update: {
          cause?: string
          id?: number
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          created_by_id: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          note: string | null
          role_id: string
          stamp_id: string
          station_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_id: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          note?: string | null
          role_id: string
          stamp_id: string
          station_id?: number | null
          updated_at: string
        }
        Update: {
          created_at?: string
          created_by_id?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          note?: string | null
          role_id?: string
          stamp_id?: string
          station_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "nsri_stations"
            referencedColumns: ["id"]
          }
        ]
      }
      log_endpoint: {
        Row: {
          created_at: string
          duration: number
          endpoint: string
          error: string | null
          id: string
          ip: string | null
          metadata: Json | null
          method: string
          parent_endpoint: string | null
          request_body: string | null
          request_headers: string | null
          response_body: string | null
          response_headers: string | null
          response_status: number | null
        }
        Insert: {
          created_at?: string
          duration: number
          endpoint: string
          error?: string | null
          id?: string
          ip?: string | null
          metadata?: Json | null
          method: string
          parent_endpoint?: string | null
          request_body?: string | null
          request_headers?: string | null
          response_body?: string | null
          response_headers?: string | null
          response_status?: number | null
        }
        Update: {
          created_at?: string
          duration?: number
          endpoint?: string
          error?: string | null
          id?: string
          ip?: string | null
          metadata?: Json | null
          method?: string
          parent_endpoint?: string | null
          request_body?: string | null
          request_headers?: string | null
          response_body?: string | null
          response_headers?: string | null
          response_status?: number | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at: string
        }
        Update: {
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_received: {
        Row: {
          account_sid: string
          address: string | null
          api_version: string
          body: string | null
          button_payload: string | null
          button_text: string | null
          from: string
          id: string
          label: string | null
          latitude: string | null
          longitude: string | null
          media_content_type0: string | null
          media_url0: string | null
          message_sid: string
          num_media: string
          num_segments: string
          original_replied_message_sender: string | null
          original_replied_message_sid: string | null
          profile_name: string
          referral_num_media: string
          sms_message_sid: string
          sms_sid: string
          sms_status: string
          timestamp: string
          to: string
          wa_id: string
        }
        Insert: {
          account_sid: string
          address?: string | null
          api_version: string
          body?: string | null
          button_payload?: string | null
          button_text?: string | null
          from: string
          id?: string
          label?: string | null
          latitude?: string | null
          longitude?: string | null
          media_content_type0?: string | null
          media_url0?: string | null
          message_sid: string
          num_media: string
          num_segments: string
          original_replied_message_sender?: string | null
          original_replied_message_sid?: string | null
          profile_name: string
          referral_num_media: string
          sms_message_sid: string
          sms_sid: string
          sms_status: string
          timestamp?: string
          to: string
          wa_id: string
        }
        Update: {
          account_sid?: string
          address?: string | null
          api_version?: string
          body?: string | null
          button_payload?: string | null
          button_text?: string | null
          from?: string
          id?: string
          label?: string | null
          latitude?: string | null
          longitude?: string | null
          media_content_type0?: string | null
          media_url0?: string | null
          message_sid?: string
          num_media?: string
          num_segments?: string
          original_replied_message_sender?: string | null
          original_replied_message_sid?: string | null
          profile_name?: string
          referral_num_media?: string
          sms_message_sid?: string
          sms_sid?: string
          sms_status?: string
          timestamp?: string
          to?: string
          wa_id?: string
        }
        Relationships: []
      }
      messages_sent: {
        Row: {
          account_sid: string
          address_retention: string | null
          api_version: string
          application_sid: string | null
          attempt: number | null
          body: string
          content_retention: string | null
          content_sid: string | null
          content_variables: Json | null
          date_created: string
          date_sent: string | null
          date_updated: string
          delivered_at: string | null
          direction: string
          error_code: string | null
          error_message: string | null
          force_delivery: boolean | null
          from: string | null
          id: string
          invitation_id: string | null
          max_price: string | null
          media_url: string[] | null
          message_status: string | null
          messaging_service_sid: string | null
          num_media: string
          num_segments: string
          persistent_action: string[] | null
          price: string | null
          price_unit: string | null
          provide_feedback: boolean | null
          read_at: string | null
          risk_check: string | null
          schedule_type: string | null
          send_as_mms: boolean | null
          send_at: string | null
          sent_at: string | null
          shorten_urls: boolean | null
          sid: string
          signed_up_at: string | null
          smart_encoded: boolean | null
          status: string
          status_callback: string | null
          subresource_uris_media: string | null
          to: string
          uri: string | null
          validity_period: number | null
        }
        Insert: {
          account_sid: string
          address_retention?: string | null
          api_version: string
          application_sid?: string | null
          attempt?: number | null
          body: string
          content_retention?: string | null
          content_sid?: string | null
          content_variables?: Json | null
          date_created: string
          date_sent?: string | null
          date_updated: string
          delivered_at?: string | null
          direction: string
          error_code?: string | null
          error_message?: string | null
          force_delivery?: boolean | null
          from?: string | null
          id?: string
          invitation_id?: string | null
          max_price?: string | null
          media_url?: string[] | null
          message_status?: string | null
          messaging_service_sid?: string | null
          num_media: string
          num_segments: string
          persistent_action?: string[] | null
          price?: string | null
          price_unit?: string | null
          provide_feedback?: boolean | null
          read_at?: string | null
          risk_check?: string | null
          schedule_type?: string | null
          send_as_mms?: boolean | null
          send_at?: string | null
          sent_at?: string | null
          shorten_urls?: boolean | null
          sid: string
          signed_up_at?: string | null
          smart_encoded?: boolean | null
          status: string
          status_callback?: string | null
          subresource_uris_media?: string | null
          to: string
          uri?: string | null
          validity_period?: number | null
        }
        Update: {
          account_sid?: string
          address_retention?: string | null
          api_version?: string
          application_sid?: string | null
          attempt?: number | null
          body?: string
          content_retention?: string | null
          content_sid?: string | null
          content_variables?: Json | null
          date_created?: string
          date_sent?: string | null
          date_updated?: string
          delivered_at?: string | null
          direction?: string
          error_code?: string | null
          error_message?: string | null
          force_delivery?: boolean | null
          from?: string | null
          id?: string
          invitation_id?: string | null
          max_price?: string | null
          media_url?: string[] | null
          message_status?: string | null
          messaging_service_sid?: string | null
          num_media?: string
          num_segments?: string
          persistent_action?: string[] | null
          price?: string | null
          price_unit?: string | null
          provide_feedback?: boolean | null
          read_at?: string | null
          risk_check?: string | null
          schedule_type?: string | null
          send_as_mms?: boolean | null
          send_at?: string | null
          sent_at?: string | null
          shorten_urls?: boolean | null
          sid?: string
          signed_up_at?: string | null
          smart_encoded?: boolean | null
          status?: string
          status_callback?: string | null
          subresource_uris_media?: string | null
          to?: string
          uri?: string | null
          validity_period?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sent_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          }
        ]
      }
      messages_status_updates: {
        Row: {
          account_sid: string | null
          api_version: string | null
          channel_install_sid: string | null
          channel_prefix: string | null
          channel_status_code: string | null
          channel_status_message: string | null
          channel_to_address: string | null
          error_code: string | null
          error_message: string | null
          from: string | null
          id: string
          message_sid: string | null
          message_status: string | null
          messaging_service_sid: string | null
          sms_sid: string | null
          sms_status: string | null
          structured_message: string | null
          timestamp: string
          to: string | null
        }
        Insert: {
          account_sid?: string | null
          api_version?: string | null
          channel_install_sid?: string | null
          channel_prefix?: string | null
          channel_status_code?: string | null
          channel_status_message?: string | null
          channel_to_address?: string | null
          error_code?: string | null
          error_message?: string | null
          from?: string | null
          id?: string
          message_sid?: string | null
          message_status?: string | null
          messaging_service_sid?: string | null
          sms_sid?: string | null
          sms_status?: string | null
          structured_message?: string | null
          timestamp?: string
          to?: string | null
        }
        Update: {
          account_sid?: string | null
          api_version?: string | null
          channel_install_sid?: string | null
          channel_prefix?: string | null
          channel_status_code?: string | null
          channel_status_message?: string | null
          channel_to_address?: string | null
          error_code?: string | null
          error_message?: string | null
          from?: string | null
          id?: string
          message_sid?: string | null
          message_status?: string | null
          messaging_service_sid?: string | null
          sms_sid?: string | null
          sms_status?: string | null
          structured_message?: string | null
          timestamp?: string
          to?: string | null
        }
        Relationships: []
      }
      nsri_stations: {
        Row: {
          created_at: string
          deleted_at: string | null
          emergency_number: string | null
          id: number
          location: Point
          metadata: Json | null
          name: string
          service_area: Polygon | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          emergency_number?: string | null
          id?: number
          location: Point
          metadata?: Json | null
          name: string
          service_area?: Polygon | null
          updated_at: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          emergency_number?: string | null
          id?: number
          location?: Point
          metadata?: Json | null
          name?: string
          service_area?: Polygon | null
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          can_create_all_invitations: boolean
          can_create_all_message_templates: boolean
          can_create_all_messages: boolean
          can_create_all_messages_received: boolean
          can_create_all_messages_sent: boolean
          can_create_all_messages_status_updates: boolean
          can_create_all_rescue_buoys: boolean
          can_create_all_roles: boolean
          can_create_all_stations: boolean
          can_create_all_users: boolean
          can_create_all_whatsapp_users: boolean
          can_create_invitations: boolean
          can_create_message_templates: boolean
          can_create_messages: boolean
          can_create_messages_received: boolean
          can_create_messages_sent: boolean
          can_create_messages_status_updates: boolean
          can_create_rescue_buoys: boolean
          can_create_roles: boolean
          can_create_stations: boolean
          can_create_users: boolean
          can_create_whatsapp_users: boolean
          can_delete_invitations: boolean
          can_delete_message_templates: boolean
          can_delete_messages: boolean
          can_delete_messages_received: boolean
          can_delete_messages_sent: boolean
          can_delete_messages_status_updates: boolean
          can_delete_rescue_buoys: boolean
          can_delete_roles: boolean
          can_delete_stations: boolean
          can_delete_users: boolean
          can_delete_whatsapp_users: boolean
          can_read_all_invitations: boolean
          can_read_all_message_templates: boolean
          can_read_all_messages: boolean
          can_read_all_messages_received: boolean
          can_read_all_messages_sent: boolean
          can_read_all_messages_status_updates: boolean
          can_read_all_rescue_buoys: boolean
          can_read_all_roles: boolean
          can_read_all_stations: boolean
          can_read_all_users: boolean
          can_read_all_whatsapp_users: boolean
          can_read_invitations: boolean
          can_read_message_templates: boolean
          can_read_messages: boolean
          can_read_messages_received: boolean
          can_read_messages_sent: boolean
          can_read_messages_status_updates: boolean
          can_read_rescue_buoys: boolean
          can_read_roles: boolean
          can_read_stations: boolean
          can_read_users: boolean
          can_read_whatsapp_users: boolean
          can_update_all_invitations: boolean
          can_update_all_message_templates: boolean
          can_update_all_messages: boolean
          can_update_all_messages_received: boolean
          can_update_all_messages_sent: boolean
          can_update_all_messages_status_updates: boolean
          can_update_all_rescue_buoys: boolean
          can_update_all_roles: boolean
          can_update_all_stations: boolean
          can_update_all_users: boolean
          can_update_all_whatsapp_users: boolean
          can_update_invitations: boolean
          can_update_message_templates: boolean
          can_update_messages: boolean
          can_update_messages_received: boolean
          can_update_messages_sent: boolean
          can_update_messages_status_updates: boolean
          can_update_rescue_buoys: boolean
          can_update_roles: boolean
          can_update_stations: boolean
          can_update_users: boolean
          can_update_whatsapp_users: boolean
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          can_create_all_invitations?: boolean
          can_create_all_message_templates?: boolean
          can_create_all_messages?: boolean
          can_create_all_messages_received?: boolean
          can_create_all_messages_sent?: boolean
          can_create_all_messages_status_updates?: boolean
          can_create_all_rescue_buoys?: boolean
          can_create_all_roles?: boolean
          can_create_all_stations?: boolean
          can_create_all_users?: boolean
          can_create_all_whatsapp_users?: boolean
          can_create_invitations?: boolean
          can_create_message_templates?: boolean
          can_create_messages?: boolean
          can_create_messages_received?: boolean
          can_create_messages_sent?: boolean
          can_create_messages_status_updates?: boolean
          can_create_rescue_buoys?: boolean
          can_create_roles?: boolean
          can_create_stations?: boolean
          can_create_users?: boolean
          can_create_whatsapp_users?: boolean
          can_delete_invitations?: boolean
          can_delete_message_templates?: boolean
          can_delete_messages?: boolean
          can_delete_messages_received?: boolean
          can_delete_messages_sent?: boolean
          can_delete_messages_status_updates?: boolean
          can_delete_rescue_buoys?: boolean
          can_delete_roles?: boolean
          can_delete_stations?: boolean
          can_delete_users?: boolean
          can_delete_whatsapp_users?: boolean
          can_read_all_invitations?: boolean
          can_read_all_message_templates?: boolean
          can_read_all_messages?: boolean
          can_read_all_messages_received?: boolean
          can_read_all_messages_sent?: boolean
          can_read_all_messages_status_updates?: boolean
          can_read_all_rescue_buoys?: boolean
          can_read_all_roles?: boolean
          can_read_all_stations?: boolean
          can_read_all_users?: boolean
          can_read_all_whatsapp_users?: boolean
          can_read_invitations?: boolean
          can_read_message_templates?: boolean
          can_read_messages?: boolean
          can_read_messages_received?: boolean
          can_read_messages_sent?: boolean
          can_read_messages_status_updates?: boolean
          can_read_rescue_buoys?: boolean
          can_read_roles?: boolean
          can_read_stations?: boolean
          can_read_users?: boolean
          can_read_whatsapp_users?: boolean
          can_update_all_invitations?: boolean
          can_update_all_message_templates?: boolean
          can_update_all_messages?: boolean
          can_update_all_messages_received?: boolean
          can_update_all_messages_sent?: boolean
          can_update_all_messages_status_updates?: boolean
          can_update_all_rescue_buoys?: boolean
          can_update_all_roles?: boolean
          can_update_all_stations?: boolean
          can_update_all_users?: boolean
          can_update_all_whatsapp_users?: boolean
          can_update_invitations?: boolean
          can_update_message_templates?: boolean
          can_update_messages?: boolean
          can_update_messages_received?: boolean
          can_update_messages_sent?: boolean
          can_update_messages_status_updates?: boolean
          can_update_rescue_buoys?: boolean
          can_update_roles?: boolean
          can_update_stations?: boolean
          can_update_users?: boolean
          can_update_whatsapp_users?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at: string
        }
        Update: {
          can_create_all_invitations?: boolean
          can_create_all_message_templates?: boolean
          can_create_all_messages?: boolean
          can_create_all_messages_received?: boolean
          can_create_all_messages_sent?: boolean
          can_create_all_messages_status_updates?: boolean
          can_create_all_rescue_buoys?: boolean
          can_create_all_roles?: boolean
          can_create_all_stations?: boolean
          can_create_all_users?: boolean
          can_create_all_whatsapp_users?: boolean
          can_create_invitations?: boolean
          can_create_message_templates?: boolean
          can_create_messages?: boolean
          can_create_messages_received?: boolean
          can_create_messages_sent?: boolean
          can_create_messages_status_updates?: boolean
          can_create_rescue_buoys?: boolean
          can_create_roles?: boolean
          can_create_stations?: boolean
          can_create_users?: boolean
          can_create_whatsapp_users?: boolean
          can_delete_invitations?: boolean
          can_delete_message_templates?: boolean
          can_delete_messages?: boolean
          can_delete_messages_received?: boolean
          can_delete_messages_sent?: boolean
          can_delete_messages_status_updates?: boolean
          can_delete_rescue_buoys?: boolean
          can_delete_roles?: boolean
          can_delete_stations?: boolean
          can_delete_users?: boolean
          can_delete_whatsapp_users?: boolean
          can_read_all_invitations?: boolean
          can_read_all_message_templates?: boolean
          can_read_all_messages?: boolean
          can_read_all_messages_received?: boolean
          can_read_all_messages_sent?: boolean
          can_read_all_messages_status_updates?: boolean
          can_read_all_rescue_buoys?: boolean
          can_read_all_roles?: boolean
          can_read_all_stations?: boolean
          can_read_all_users?: boolean
          can_read_all_whatsapp_users?: boolean
          can_read_invitations?: boolean
          can_read_message_templates?: boolean
          can_read_messages?: boolean
          can_read_messages_received?: boolean
          can_read_messages_sent?: boolean
          can_read_messages_status_updates?: boolean
          can_read_rescue_buoys?: boolean
          can_read_roles?: boolean
          can_read_stations?: boolean
          can_read_users?: boolean
          can_read_whatsapp_users?: boolean
          can_update_all_invitations?: boolean
          can_update_all_message_templates?: boolean
          can_update_all_messages?: boolean
          can_update_all_messages_received?: boolean
          can_update_all_messages_sent?: boolean
          can_update_all_messages_status_updates?: boolean
          can_update_all_rescue_buoys?: boolean
          can_update_all_roles?: boolean
          can_update_all_stations?: boolean
          can_update_all_users?: boolean
          can_update_all_whatsapp_users?: boolean
          can_update_invitations?: boolean
          can_update_message_templates?: boolean
          can_update_messages?: boolean
          can_update_messages_received?: boolean
          can_update_messages_sent?: boolean
          can_update_messages_status_updates?: boolean
          can_update_rescue_buoys?: boolean
          can_update_roles?: boolean
          can_update_stations?: boolean
          can_update_users?: boolean
          can_update_whatsapp_users?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rescue_buoys: {
        Row: {
          buoy_id: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: Point
          metadata: Json | null
          name: string
          old_id: string | null
          station_id: number | null
          status: Database["public"]["Enums"]["buoy_status"]
          updated_at: string
        }
        Insert: {
          buoy_id?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location: Point
          metadata?: Json | null
          name: string
          old_id?: string | null
          station_id?: number | null
          status?: Database["public"]["Enums"]["buoy_status"]
          updated_at?: string
        }
        Update: {
          buoy_id?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: Point
          metadata?: Json | null
          name?: string
          old_id?: string | null
          station_id?: number | null
          status?: Database["public"]["Enums"]["buoy_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rescue_buoys_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "nsri_stations"
            referencedColumns: ["id"]
          }
        ]
      }
      rescue_buoys_logs: {
        Row: {
          alt: number
          changed_by: string
          comment: string | null
          created_at: string
          deleted_at: string | null
          id: string
          lat: number
          lng: number
          rescue_buoy_id: string
          status: string
          updated_at: string
        }
        Insert: {
          alt: number
          changed_by: string
          comment?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          lat: number
          lng: number
          rescue_buoy_id: string
          status: string
          updated_at: string
        }
        Update: {
          alt?: number
          changed_by?: string
          comment?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          lat?: number
          lng?: number
          rescue_buoy_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rescue_buoys_logs_rescue_buoy_id_fkey"
            columns: ["rescue_buoy_id"]
            isOneToOne: false
            referencedRelation: "rescue_buoys"
            referencedColumns: ["id"]
          }
        ]
      }
      rescued_detail: {
        Row: {
          age: string | null
          age_group: Database["public"]["Enums"]["age_group"] | null
          buoy_rescue_id: number | null
          ethnicity: Database["public"]["Enums"]["ethnicity"] | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: number
          used_buoy: boolean | null
        }
        Insert: {
          age?: string | null
          age_group?: Database["public"]["Enums"]["age_group"] | null
          buoy_rescue_id?: number | null
          ethnicity?: Database["public"]["Enums"]["ethnicity"] | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: number
          used_buoy?: boolean | null
        }
        Update: {
          age?: string | null
          age_group?: Database["public"]["Enums"]["age_group"] | null
          buoy_rescue_id?: number | null
          ethnicity?: Database["public"]["Enums"]["ethnicity"] | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: number
          used_buoy?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "rescued_detail_buoy_rescue_id_fkey"
            columns: ["buoy_rescue_id"]
            isOneToOne: false
            referencedRelation: "buoy_rescue"
            referencedColumns: ["id"]
          }
        ]
      }
      rescuer_detail: {
        Row: {
          age: string | null
          buoy_rescue_id: number | null
          capacity: string | null
          experience: string | null
          id: number
          name: string | null
          used_buoy: boolean | null
        }
        Insert: {
          age?: string | null
          buoy_rescue_id?: number | null
          capacity?: string | null
          experience?: string | null
          id?: number
          name?: string | null
          used_buoy?: boolean | null
        }
        Update: {
          age?: string | null
          buoy_rescue_id?: number | null
          capacity?: string | null
          experience?: string | null
          id?: number
          name?: string | null
          used_buoy?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "rescuer_detail_buoy_rescue_id_fkey"
            columns: ["buoy_rescue_id"]
            isOneToOne: false
            referencedRelation: "buoy_rescue"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          id: string
          level: number
          name: string
          station_id: number | null
        }
        Insert: {
          id?: string
          level: number
          name: string
          station_id?: number | null
        }
        Update: {
          id?: string
          level?: number
          name?: string
          station_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "nsri_stations"
            referencedColumns: ["id"]
          }
        ]
      }
      roleships: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          invitation_id: string | null
          role_id: string
          station_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          invitation_id?: string | null
          role_id: string
          station_id?: number | null
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          invitation_id?: string | null
          role_id?: string
          station_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roleships_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roleships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roleships_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "nsri_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roleships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          phone: string | null
          updated_at: string
          whatsapp_user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at: string
          whatsapp_user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
          whatsapp_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_whatsapp_user_id_fkey"
            columns: ["whatsapp_user_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_users"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_users: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          profile_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          profile_name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          profile_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_send_invitation: {
        Args: {
          target_role_level: number
          target_station_id?: number
        }
        Returns: boolean
      }
      execute_schema_tables: {
        Args: {
          _schema: string
          _tables: string[]
        }
        Returns: string
      }
    }
    Enums: {
      age_group: "ADULT" | "CHILD" | "UNKNOWN"
      buoy_status: "OK" | "MISSING" | "PROPOSED" | "ATTENTION" | "UNKNOWN"
      ethnicity:
        | "COLOURED"
        | "WHITE"
        | "BLACK"
        | "INDIAN"
        | "CHINESE"
        | "FOREIGN"
        | "UNKNOWN"
      gender: "MALE" | "FEMALE" | "UNKNOWN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
