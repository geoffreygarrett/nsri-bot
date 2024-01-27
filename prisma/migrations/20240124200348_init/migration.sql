CREATE SCHEMA IF NOT EXISTS "extensions";

CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "public"."buoy_status" AS ENUM ('OK', 'MISSING', 'PROPOSED', 'ATTENTION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ethnicity" AS ENUM ('COLOURED', 'WHITE', 'BLACK', 'INDIAN', 'CHINESE', 'FOREIGN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."age_group" AS ENUM ('ADULT', 'CHILD', 'UNKNOWN');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "first_name" TEXT DEFAULT '',
    "last_name" TEXT DEFAULT '',
    "phone" TEXT,
    "whatsapp_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "station_id" INTEGER,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roleships" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "station_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roleships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsapp_users" (
    "id" UUID NOT NULL,
    "profile_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "whatsapp_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "can_read_users" BOOLEAN NOT NULL DEFAULT false,
    "can_read_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_read_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_read_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_read_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_read_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_read_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_read_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_read_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_read_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_read_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "can_create_users" BOOLEAN NOT NULL DEFAULT false,
    "can_create_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_create_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_create_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_create_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_create_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_create_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_create_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_create_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_create_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_create_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "can_update_users" BOOLEAN NOT NULL DEFAULT false,
    "can_update_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_update_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_update_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_update_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_update_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_update_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_update_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_update_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_update_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_update_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_users" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_users" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_read_all_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_users" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_create_all_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_users" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_stations" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_rescue_buoys" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_message_templates" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_invitations" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_whatsapp_users" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_messages_received" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_messages_sent" BOOLEAN NOT NULL DEFAULT false,
    "can_update_all_messages_status_updates" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "stamp_id" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "role_id" UUID NOT NULL,
    "station_id" INTEGER,
    "note" TEXT,
    "metadata" JSONB,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_endpoint" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parent_endpoint" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "request_body" TEXT,
    "request_headers" TEXT,
    "response_body" TEXT,
    "response_headers" TEXT,
    "response_status" INTEGER,
    "duration" DOUBLE PRECISION NOT NULL,
    "ip" TEXT,
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "log_endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nsri_stations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emergency_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "metadata" JSONB,
    "location" geometry(PointZ, 4326) NOT NULL,
    "service_area" geometry(Polygon, 4326),

    CONSTRAINT "nsri_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rescue_buoys" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "station_id" INTEGER,
    "buoy_id" INTEGER,
    "name" TEXT NOT NULL,
    "old_id" TEXT,
    "status" "public"."buoy_status" NOT NULL DEFAULT 'OK',
    "image_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "location" geometry(PointZ, 4326) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "rescue_buoys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."buoy_rescue" (
    "id" SERIAL NOT NULL,
    "reference_no" TEXT,
    "datetime" TIMESTAMP(3),
    "people_assisted" INTEGER,
    "pink_buoy_not_used_people" INTEGER,
    "max_persons_floated" INTEGER,
    "prb_location_number" TEXT,
    "place" TEXT,
    "city" TEXT,
    "sponsor" TEXT,
    "rescue" TEXT,
    "drowning_cause_id" INTEGER,
    "additional_info" TEXT,
    "link" TEXT,
    "rescue_buoy_id" UUID NOT NULL,
    "rescue_buoys_log_id" UUID,

    CONSTRAINT "buoy_rescue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rescuer_detail" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "age" TEXT,
    "experience" TEXT,
    "capacity" TEXT,
    "used_buoy" BOOLEAN,
    "buoy_rescue_id" INTEGER,

    CONSTRAINT "rescuer_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rescued_detail" (
    "id" SERIAL NOT NULL,
    "ethnicity" "public"."ethnicity",
    "gender" "public"."gender",
    "age_group" "public"."age_group",
    "age" TEXT,
    "used_buoy" BOOLEAN,
    "buoy_rescue_id" INTEGER,

    CONSTRAINT "rescued_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drowning_cause" (
    "id" SERIAL NOT NULL,
    "cause" TEXT NOT NULL,

    CONSTRAINT "drowning_cause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rescue_buoys_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "rescue_buoy_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "alt" DOUBLE PRECISION NOT NULL,
    "changed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "comment" TEXT,

    CONSTRAINT "rescue_buoys_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_templates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages_received" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sms_message_sid" TEXT NOT NULL,
    "num_media" TEXT NOT NULL,
    "profile_name" TEXT NOT NULL,
    "sms_sid" TEXT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "sms_status" TEXT NOT NULL,
    "body" TEXT,
    "to" TEXT NOT NULL,
    "num_segments" TEXT NOT NULL,
    "referral_num_media" TEXT NOT NULL,
    "message_sid" TEXT NOT NULL,
    "account_sid" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "api_version" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "media_content_type0" TEXT,
    "media_url0" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "address" TEXT,
    "label" TEXT,
    "original_replied_message_sender" TEXT,
    "original_replied_message_sid" TEXT,
    "button_text" TEXT,
    "button_payload" TEXT,

    CONSTRAINT "messages_received_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages_sent" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "body" TEXT NOT NULL,
    "num_segments" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "from" TEXT,
    "to" TEXT NOT NULL,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "price" TEXT,
    "error_message" TEXT,
    "uri" TEXT,
    "account_sid" TEXT NOT NULL,
    "num_media" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messaging_service_sid" TEXT,
    "sid" TEXT NOT NULL,
    "date_sent" TIMESTAMP(3),
    "date_created" TIMESTAMP(3) NOT NULL,
    "error_code" TEXT,
    "price_unit" TEXT,
    "api_version" TEXT NOT NULL,
    "subresource_uris_media" TEXT,
    "message_status" TEXT,
    "delivered_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "signed_up_at" TIMESTAMP(3),
    "status_callback" TEXT,
    "application_sid" TEXT,
    "max_price" TEXT,
    "provide_feedback" BOOLEAN,
    "attempt" INTEGER,
    "validity_period" INTEGER,
    "force_delivery" BOOLEAN,
    "content_retention" TEXT,
    "address_retention" TEXT,
    "smart_encoded" BOOLEAN,
    "persistent_action" TEXT[],
    "shorten_urls" BOOLEAN,
    "schedule_type" TEXT,
    "send_at" TIMESTAMP(3),
    "send_as_mms" BOOLEAN,
    "content_variables" JSONB,
    "risk_check" TEXT,
    "media_url" TEXT[],
    "content_sid" TEXT,
    "invitation_id" UUID,

    CONSTRAINT "messages_sent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages_status_updates" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel_prefix" TEXT,
    "api_version" TEXT NOT NULL,
    "message_status" TEXT NOT NULL,
    "sms_sid" TEXT NOT NULL,
    "sms_status" TEXT NOT NULL,
    "channel_install_sid" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "message_sid" TEXT NOT NULL,
    "structured_message" TEXT,
    "account_sid" TEXT NOT NULL,
    "channel_to_address" TEXT NOT NULL,
    "messaging_service_sid" TEXT,
    "channel_status_message" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "channel_status_code" TEXT,

    CONSTRAINT "messages_status_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_permissionsToroles" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "public"."users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_users_id_key" ON "public"."whatsapp_users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_stamp_id_key" ON "public"."invitations"("stamp_id");

-- CreateIndex
CREATE INDEX "nsri_stations_location_idx" ON "public"."nsri_stations" USING GIST ("location");

-- CreateIndex
CREATE INDEX "rescue_buoy_location_idx" ON "public"."rescue_buoys" USING GIST ("location");

-- CreateIndex
CREATE INDEX "rescue_buoys_logs_rescue_buoy_id_idx" ON "public"."rescue_buoys_logs"("rescue_buoy_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_sent_sid_key" ON "public"."messages_sent"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "_permissionsToroles_AB_unique" ON "public"."_permissionsToroles"("A", "B");

-- CreateIndex
CREATE INDEX "_permissionsToroles_B_index" ON "public"."_permissionsToroles"("B");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_whatsapp_user_id_fkey" FOREIGN KEY ("whatsapp_user_id") REFERENCES "public"."whatsapp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."nsri_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roleships" ADD CONSTRAINT "roleships_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roleships" ADD CONSTRAINT "roleships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roleships" ADD CONSTRAINT "roleships_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."nsri_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."nsri_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rescue_buoys" ADD CONSTRAINT "rescue_buoys_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."nsri_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."buoy_rescue" ADD CONSTRAINT "buoy_rescue_drowning_cause_id_fkey" FOREIGN KEY ("drowning_cause_id") REFERENCES "public"."drowning_cause"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."buoy_rescue" ADD CONSTRAINT "buoy_rescue_rescue_buoy_id_fkey" FOREIGN KEY ("rescue_buoy_id") REFERENCES "public"."rescue_buoys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."buoy_rescue" ADD CONSTRAINT "buoy_rescue_rescue_buoys_log_id_fkey" FOREIGN KEY ("rescue_buoys_log_id") REFERENCES "public"."rescue_buoys_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rescuer_detail" ADD CONSTRAINT "rescuer_detail_buoy_rescue_id_fkey" FOREIGN KEY ("buoy_rescue_id") REFERENCES "public"."buoy_rescue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rescued_detail" ADD CONSTRAINT "rescued_detail_buoy_rescue_id_fkey" FOREIGN KEY ("buoy_rescue_id") REFERENCES "public"."buoy_rescue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rescue_buoys_logs" ADD CONSTRAINT "rescue_buoys_logs_rescue_buoy_id_fkey" FOREIGN KEY ("rescue_buoy_id") REFERENCES "public"."rescue_buoys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages_sent" ADD CONSTRAINT "messages_sent_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_permissionsToroles" ADD CONSTRAINT "_permissionsToroles_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_permissionsToroles" ADD CONSTRAINT "_permissionsToroles_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
