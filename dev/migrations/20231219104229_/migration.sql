/*
  Warnings:

  - You are about to drop the `received_message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rescue_buoy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."received_message";

-- DropTable
DROP TABLE "public"."rescue_buoy";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rescue_buoys" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "station_id" TEXT NOT NULL,
    "pbr_id" VARCHAR(255),
    "name" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lng" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "old_id" TEXT,
    "status" TEXT NOT NULL,
    "formatted_address" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "town_code" TEXT NOT NULL,

    CONSTRAINT "rescue_buoys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rescue_buoy_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "rescue_buoy_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lng" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "comment" TEXT,

    CONSTRAINT "rescue_buoy_logs_pkey" PRIMARY KEY ("id")
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
    "original_replied_message_sender" TEXT,
    "original_replied_message_sid" TEXT,
    "button_text" TEXT,
    "button_payload" TEXT,

    CONSTRAINT "messages_received_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages_sent" (
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
    "original_replied_message_sender" TEXT,
    "original_replied_message_sid" TEXT,
    "button_text" TEXT,
    "button_payload" TEXT,

    CONSTRAINT "messages_sent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_status_updates" (
    "id" TEXT NOT NULL,
    "channel_prefix" TEXT NOT NULL,
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
    "channel_status_message" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "channel_status_code" TEXT,

    CONSTRAINT "message_status_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wa_id_key" ON "public"."users"("wa_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "rescue_buoy_logs_rescue_buoy_id_idx" ON "public"."rescue_buoy_logs"("rescue_buoy_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_status_updates_sms_sid_key" ON "public"."message_status_updates"("sms_sid");

-- AddForeignKey
ALTER TABLE "public"."rescue_buoys" ADD CONSTRAINT "rescue_buoys_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rescue_buoy_logs" ADD CONSTRAINT "rescue_buoy_logs_rescue_buoy_id_fkey" FOREIGN KEY ("rescue_buoy_id") REFERENCES "public"."rescue_buoys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
