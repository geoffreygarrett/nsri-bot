import {PrismaClient} from "@prisma/client";
import {Prisma} from ".prisma/client";

export const invitationRLS = async (prisma: PrismaClient) => {
    // Enable Row Level Security on the invitations table
    await prisma.$executeRaw(Prisma.sql`
        ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Enable read access for all users" ON "public"."invitations"
        AS PERMISSIVE FOR SELECT
        TO public
        USING (true)
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Enable delete for users based on user_id" ON "public"."invitations"
        AS PERMISSIVE FOR DELETE
        TO public
        USING (auth.uid() = created_by_id)
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Enable insert for users based on user_id" ON "public"."invitations"
        AS PERMISSIVE FOR INSERT
        TO public
        WITH CHECK (auth.uid() = created_by_id)
    `);

    // Apply the policies
    await prisma.$executeRaw(Prisma.sql`
        ALTER TABLE invitations FORCE ROW LEVEL SECURITY;
    `);
};
