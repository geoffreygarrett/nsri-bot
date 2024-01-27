import {PrismaClient} from "@prisma/client";
import {Prisma} from ".prisma/client";


export const supabaseRPC = async (prisma: PrismaClient) => {

    await prisma.$executeRaw(Prisma.sql`
        CREATE OR REPLACE FUNCTION can_send_invitation(target_role_level INT, target_station_id INT DEFAULT NULL)
        RETURNS BOOLEAN AS $$
        DECLARE
            user_role_level INT;
            is_authorized BOOLEAN;
        BEGIN
            -- Find the lowest role level of the user
            SELECT MIN(roles.level) INTO user_role_level
            FROM roleships
            JOIN roles ON roleships.role_id = roles.id
            WHERE roleships.user_id = auth.uid();
        
            -- Default to not authorized
            is_authorized := FALSE;
        
            -- Check authorization based on role level
            IF user_role_level = 0 THEN
                -- Super admins can invite anyone
                is_authorized := TRUE;
                
            ELSIF user_role_level = 1 THEN
                -- Station admins can invite users with level 1 or 2 to their own station
                -- but cannot invite a super admin
                is_authorized := (target_role_level BETWEEN 1 AND 2 AND
                                  target_station_id IN (SELECT station_id FROM roleships WHERE user_id = auth.uid()));
                                  
            ELSIF user_role_level = 2 THEN
                -- Station users can invite users with level 2 to their own station
                -- but cannot invite a super admin
                is_authorized := target_role_level = 2 AND
                                 target_station_id IN (SELECT station_id FROM roleships WHERE user_id = auth.uid());
                                 
            END IF;
        
            RETURN is_authorized;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

}