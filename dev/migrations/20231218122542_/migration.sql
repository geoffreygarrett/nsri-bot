/*
  Warnings:

  - You are about to drop the column `address_components` on the `rescue_buoy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."rescue_buoy" DROP COLUMN "address_components";

-- CreateTable
CREATE TABLE "public"."received_message" (
    "id" TEXT NOT NULL,
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
    "media_content_type0" TEXT,
    "media_url0" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,

    CONSTRAINT "received_message_pkey" PRIMARY KEY ("id")
);
