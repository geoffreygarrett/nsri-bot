-- AlterTable
ALTER TABLE "public"."messages_status_updates" ALTER COLUMN "api_version" DROP NOT NULL,
ALTER COLUMN "message_status" DROP NOT NULL,
ALTER COLUMN "sms_sid" DROP NOT NULL,
ALTER COLUMN "sms_status" DROP NOT NULL,
ALTER COLUMN "channel_install_sid" DROP NOT NULL,
ALTER COLUMN "to" DROP NOT NULL,
ALTER COLUMN "from" DROP NOT NULL,
ALTER COLUMN "message_sid" DROP NOT NULL,
ALTER COLUMN "account_sid" DROP NOT NULL,
ALTER COLUMN "channel_to_address" DROP NOT NULL;
