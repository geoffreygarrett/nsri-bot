import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {mapUserRoles, rolePermissionResponseSchema} from "@/app/_services/roles-permissions";
import {Database} from "@/supabase";
import {cookies} from "next/headers";
import {z} from "zod";
import {createErrorResponse} from "@/app/api/helper";


/**
 * GET Endpoint to fetch roles and permissions.
 *
 * Handles GET requests to fetch roles and permissions for either the current user
 * or a specific user identified by their user ID. Data is extracted directly from the Supabase database.
 *
 * Possible HTTP Status Codes:
 * - 200 OK: Successful fetch of roles and permissions.
 * - 401 Unauthorized: Current user authentication failed.
 * - 404 Not Found: No user or data found for the provided ID.
 * - 500 Internal Server Error: Server-side error or exception.
 *
 * @param {NextRequest} request - The incoming request object from Next.js.
 * @returns {Promise<NextResponse>} - A promise that resolves to a response object containing roles and permissions or an error message.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});
    const userId = request.nextUrl.pathname.split('/').pop();

    try {
        let response;
        if (userId && userId !== 'roles-permissions') {
            // Fetch roles and permissions for a specific user by ID
            response = await supabase
                .from("users")
                .select("*, roleships ( roles (*), nsri_stations (*) )")
                .eq("id", userId)
                .single();
        } else {
            // Fetch roles and permissions for the current authenticated user
            const {data: {user}, error} = await supabase.auth.getUser();
            if (error || !user) {
                return createErrorResponse({
                    message: "Failed to authenticate the current user",
                    details: error?.message || "User authentication failed",
                    hint: "Ensure user is logged in",
                }, 401);
            }

            response = await supabase
                .from("users")
                .select("*, roleships ( roles (*), nsri_stations (*) )")
                .eq("id", user.id)
                .single();
        }

        const data = response.data;
        if (!data) {
            // No data found for the user
            return createErrorResponse({
                message: "No data found",
                details: "No roles or permissions available for the user",
                hint: "Check user ID validity",
            }, 404);
        }

        // Parse roles and permissions using Zod
        const parsedData = rolePermissionResponseSchema.parse({
            roles: mapUserRoles(data),
            permissions: [] // Assuming permissions is an empty array for now
        });

        // Successful fetch and validation of roles and permissions
        return new NextResponse(JSON.stringify(parsedData), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
        });


    } catch (error: any) {
        if (error instanceof z.ZodError) {
            // Handle Zod parsing errors
            return createErrorResponse({
                message: "Data validation error",
                details: "Roles or permissions data format is invalid",
                hint: "Check the data format",
            }, 400);
        }

        // Internal server error or exception
        return createErrorResponse({
            message: error.message || 'Internal server error',
            details: "Error occurred while fetching data",
            hint: "Contact support",
        }, 500);
    }
}
