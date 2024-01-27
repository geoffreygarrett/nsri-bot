-- AlterTable
ALTER TABLE "public"."roleships" ADD COLUMN     "invitation_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."roleships" ADD CONSTRAINT "roleships_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
