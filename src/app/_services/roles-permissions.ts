// Helper function to map user roles
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {QueryData} from "@supabase/supabase-js";


import {z} from "zod";


// Regex patterns for roles
const rolesRegex = /^(super-admin|station-admin(:\d+)?|station-user(:\d+)?|public-user|unknown)$/;
// const rolesRegex = /^(super-admin|station-admin:\d+|station-user:\d+|public-user|unknown)$/;

export const rolePermissionResponseSchema = z.object({
    roles: z.array(z.string().regex(rolesRegex, "Invalid role format")),
    permissions: z.array(z.string())
});

export const makeRoleshipsQuery = (supabase: SupabaseClient<Database>) => {
    return supabase.auth.getUser().then((user) => {
        if (!user.data?.user?.id) throw new Error("No user id found");
        return supabase
            .from("users")
            .select(`*, roleships ( roles (*), nsri_stations (*) )`)
            .eq("id", user.data.user?.id).single();
    });
}

export type UserWithRoleshipsType = QueryData<ReturnType<typeof makeRoleshipsQuery>>;


export const getRole = (name: string, station?: number): string => {
    return `${name}${station ? `:${station}` : ""}`;
}

export const mapUserRoles = (user: UserWithRoleshipsType) => {
    return user.roleships.map((roleship) => {
        switch (roleship.roles?.name) {
            case "super-admin":
                return getRole("super-admin");
            case "station-admin":
                return getRole("station-admin", roleship.nsri_stations?.id);
            case "station-user":
                return getRole("station-user", roleship.nsri_stations?.id);
            case "user":
                return getRole("public-user");
            default:
                return "unknown";
        }
    });
};


/**
 * Fetches roles and permissions for a specified user or the current user from the server.
 *
 * This function sends a GET request to the `/api/roles-permissions` endpoint. If a userId is
 * provided, it fetches for that specific user; otherwise, it fetches for the current user.
 * The function parses the response using the Zod schema and returns the roles and permissions.
 *
 * @param {string} [userId] - The ID of the user for whom to fetch roles and permissions. Optional.
 * @returns {Promise<{roles: string[], permissions: string[]}>} A promise that resolves to the roles and permissions.
 */
const fetchRolesAndPermissions = async (userId: string | undefined) => {
    const endpoint = userId ? `/api/roles-permissions/${userId}` : `/api/roles-permissions`;
    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsed = rolePermissionResponseSchema.parse(data);
        return parsed;
    } catch (error: any) {
        console.error("Error fetching or parsing data:", error.message);
        throw error;
    }
};
