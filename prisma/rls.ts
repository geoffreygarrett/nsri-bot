import {PrismaClient} from "@prisma/client";
import {Prisma} from ".prisma/client";

export const rescueBuoyRLS = async (prisma: PrismaClient) => {
    // Enable Row Level Security on the rescue_buoys table
    await prisma.$executeRaw(Prisma.sql`
        ALTER TABLE rescue_buoys ENABLE ROW LEVEL SECURITY;
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE OR REPLACE FUNCTION raise_permission_denied(detail TEXT) RETURNS void AS $$
        BEGIN
          RAISE EXCEPTION 'Permission Denied: %', detail;
        END;
        $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRaw(Prisma.sql`
         -- Function to check if a user is a station admin for a specific station
        CREATE OR REPLACE FUNCTION is_nsri_station_admin(_user_id UUID, _station_id INT) RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1
            FROM roleships
            JOIN roles ON roleships.role_id = roles.id
            WHERE roleships.user_id = _user_id
            AND roles.name = 'station-admin'
            AND roleships.station_id = _station_id
          );
        END;
        $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRaw(Prisma.sql`
        -- Function to check if a user is a super admin
        CREATE OR REPLACE FUNCTION is_nsri_super_admin(_user_id UUID) RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1
            FROM roleships
            JOIN roles ON roleships.role_id = roles.id
            WHERE roleships.user_id = _user_id
            AND roles.name = 'super-admin'
          );
        END;
        $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE OR REPLACE FUNCTION can_update_rescue_buoys(_user_id UUID, _station_id INT) RETURNS BOOLEAN AS $$
        BEGIN
          RETURN is_nsri_super_admin(_user_id)
              OR is_nsri_station_admin(_user_id, _station_id);
        END;
        $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE OR REPLACE FUNCTION can_insert_rescue_buoys(_user_id UUID, _station_id INT) RETURNS BOOLEAN AS $$
        BEGIN
          RETURN is_nsri_super_admin(_user_id)
              OR is_nsri_station_admin(_user_id, _station_id);
        END;
        $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE OR REPLACE FUNCTION can_delete_rescue_buoys(_user_id UUID, _station_id INT) RETURNS BOOLEAN AS $$
        BEGIN
          RETURN is_nsri_super_admin(_user_id);
        END;
        $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Anyone can view the rescue buoys" ON "public"."rescue_buoys"
        AS PERMISSIVE FOR SELECT
        TO public
        USING ( true );
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Super Admin can update all rescue buoys" 
        ON "public"."rescue_buoys" 
        AS PERMISSIVE FOR ALL
        TO public 
        USING ( is_nsri_super_admin(auth.uid()) );
    `);


    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Station Admins can update rescue buoys for their station" 
        ON "public"."rescue_buoys"
        AS PERMISSIVE FOR UPDATE
        TO public
        USING ( is_nsri_station_admin(auth.uid(), station_id) );
    `);

    await prisma.$executeRaw(Prisma.sql`
        CREATE POLICY "Station Admins can insert rescue buoys for their station" 
        ON "public"."rescue_buoys"
        AS PERMISSIVE FOR INSERT
        TO public
        WITH CHECK ( is_nsri_station_admin(auth.uid(), station_id );
    `);

    // Apply the policies
    await prisma.$executeRaw(Prisma.sql`
        ALTER TABLE rescue_buoys FORCE ROW LEVEL SECURITY;
    `);
}

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
