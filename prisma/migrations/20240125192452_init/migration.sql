/*
  Warnings:

  - You are about to drop the column `alt` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `changed_by` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `rescue_buoys_logs` table. All the data in the column will be lost.
  - Added the required column `action` to the `rescue_buoys_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `rescue_buoys_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."log_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'MAINTENANCE', 'USED');

-- DropIndex
DROP INDEX "public"."rescue_buoys_logs_rescue_buoy_id_idx";

-- AlterTable
ALTER TABLE "public"."rescue_buoys_logs" DROP COLUMN "alt",
DROP COLUMN "changed_by",
DROP COLUMN "comment",
DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "action" "public"."log_action" NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "new_values" JSONB,
ADD COLUMN     "old_values" JSONB,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."rescue_buoys_logs" ADD CONSTRAINT "rescue_buoys_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
