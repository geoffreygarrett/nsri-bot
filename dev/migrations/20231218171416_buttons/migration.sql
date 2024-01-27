-- AlterTable
ALTER TABLE "public"."received_message" ADD COLUMN     "button_payload" TEXT,
ADD COLUMN     "button_text" TEXT,
ADD COLUMN     "original_replied_message_sender" TEXT,
ADD COLUMN     "original_replied_message_sid" TEXT;
