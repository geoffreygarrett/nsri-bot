import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/supabase";
import {cookies} from "next/headers";
import {
    createErrorResponse,
    createSuccessResponse,
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR,
    HTTP_SUCCESS
} from "@/app/api/helper";

const THIS_ENDPOINT = `/api/invitations`;

/**
 * GET Endpoint to fetch invitations.
 *
 * Detailed documentation...
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});
    const userId = request.nextUrl.pathname.split('/').pop();

    try {
        let response;
        if (userId && userId !== 'invitations') {
            response = await fetchInvitations(supabase, userId);
        } else {
            const userResponse = await supabase.auth.getUser();
            if (!userResponse.data || userResponse.error) {
                return createErrorResponse({
                    message: 'Failed to authenticate user',
                    details: userResponse.error?.message ?? 'No error message'
                }, HTTP_CLIENT_ERROR.UNAUTHORIZED);
            }
            response = await fetchInvitations(supabase, userResponse.data.user?.id);
        }

        if (!response.data) {
            return createErrorResponse({
                message: 'No data found',
                details: 'No invitations available for the user'
            }, HTTP_CLIENT_ERROR.NOT_FOUND);
        }

        return createSuccessResponse(response.data, HTTP_SUCCESS.OK);
    } catch (error: any) {
        return createErrorResponse({
            message: 'Internal server error',
            details: error.message ?? 'No error message'
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }
}

async function fetchInvitations(supabase: SupabaseClient<Database>, userId: string) {
    return supabase
        .from('invitations')
        .select(`*, messages_sent ( * )`)
        .eq('created_by_id', userId)
        .order('created_at', {ascending: false});
}
