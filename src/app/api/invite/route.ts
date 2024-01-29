import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {cookies} from "next/headers";
import {getBaseUrl, getExternalIp} from "@/code/domain";
import {InvitationFormValues} from "@/app/(dash)/invite/_components/invitation-form";
import ShortUniqueId from "short-unique-id";
import {ApiLogger, LoggingMode} from "@/app/api/logger";
import {
    createErrorResponse,
    createSuccessResponse,
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR,
    HTTP_SUCCESS
} from "@/app/api/helper";

const WA_SEND_ENDPOINT = `/api/wa/send`;
const THIS_ENDPOINT = `/api/invite`;

export async function POST(request: NextRequest): Promise<NextResponse> {
    const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});
    const apiLogger = new ApiLogger(supabase, LoggingMode.All, 1, THIS_ENDPOINT);
    const invitation: InvitationFormValues = await request.json();

    const user = await supabase.auth.getUser();
    if (!user.data || user.error) {
        return createErrorResponse({
            message: 'Failed to get user',
            details: user.error?.message ?? 'No error message'
        }, HTTP_CLIENT_ERROR.UNAUTHORIZED);
    }

    console.log(invitation);

    // Check if user is authorized to send invitation
    const {
        data: role,
        error: rolesError
    } = await supabase
        .from('roles')
        .select('*')
        .eq('id', invitation.role)
        .single();

    console.log(role);

    // Check if role exists
    if (!role || rolesError || role.level === null || role.level === undefined) {
        return createErrorResponse({
            message: 'Failed to get role',
            details: rolesError?.message ?? 'No error message'
        }, HTTP_CLIENT_ERROR.UNAUTHORIZED);
    }

    // Check invitation security
    const {
        data : authorized,
        error
    } = await supabase
        .rpc('can_send_invitation', {
            target_role_level: role?.level,
            target_station_id: invitation.station_id
        })

    // Check if user is authorized to send invitation
    if (!authorized || error) {
        return createErrorResponse({
            message: 'Not authorized to send invitation',
            details: error?.message ?? 'No error message'
        }, HTTP_CLIENT_ERROR.UNAUTHORIZED);
    }

    // Insert invitation
    const uid = new ShortUniqueId();
    const shortIdLength = 10;
    const validHours = 24;
    const validDuration = validHours * 60 * 60 * 1000;
    const createdAt = new Date();
    const invitationInsertPayload = {
        created_by_id: user.data.user?.id,
        role_id: invitation.role,
        station_id: invitation.station_id ? Number(invitation.station_id) : null,
        note: invitation.note,
        stamp_id: uid.stamp(shortIdLength, new Date(Date.now() + validDuration)),
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
    };

    // Insert invitation
    const invitationInsertResponse = await insertInvitation(supabase, apiLogger, invitationInsertPayload);
    if (invitationInsertResponse.error) {
        console.log(invitationInsertResponse.error);
        return createErrorResponse({
            ...invitationInsertResponse.error,
            message: 'Failed to insert invitation: ' + invitationInsertResponse.error.message
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }

    // Send WhatsApp invitations
    const sendInvitationResponse = await sendWhatsAppInvitations(apiLogger, invitation, invitationInsertResponse.data);
    if (sendInvitationResponse.error) {
        return createErrorResponse({
            ...sendInvitationResponse.error,
            message: 'Failed to send WhatsApp invitations',
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }

    // Flush logs
    await apiLogger.flush();

    // Return response
    return createSuccessResponse({
        invitation: invitationInsertResponse.data,
        messages_sent: sendInvitationResponse.data
    }, HTTP_SUCCESS.CREATED);

}

async function insertInvitation(supabase: SupabaseClient<Database>, apiLogger: ApiLogger, payload: any) {
    const startTime = new Date();
    const response = await supabase.from('invitations').insert(payload).select(`*, roles ( * )`).single().then((response) => {
        apiLogger.logSupabaseOperation('invitations', 'INSERT', startTime, response, payload);
        return response;
    });

    return {data: response.data, error: response.error};
}

async function sendWhatsAppInvitations(apiLogger: ApiLogger, invitation: InvitationFormValues, invitationData: any, validHours = 24) {
    const externalIP = await getExternalIp();
    const messagePayload = invitation.numbers.map((number) => ({
        to: `whatsapp:${number}`,
        from: "MGe78fadf418b09d3df1924001b5007712",
        contentSid: 'HXc0f4fcc8fcb3c7c24fb2b9bc88876757',
        statusCallback: `http://${externalIP}:8080/api/wa/status_callback`,
        contentVariables: JSON.stringify({
            1: `${invitationData.stamp_id}?phone=${number}`.replace("+", ""),
            2: `Station ${invitationData.station_id} (${invitationData.roles!.name})`,
            3: `${validHours.toString()} hours`,
        }),
        invitationId: invitationData.id,
    }));

    const sendResponse = await apiLogger.logFetch(`${getBaseUrl()}${WA_SEND_ENDPOINT}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(messagePayload)
    });

    if (!sendResponse.ok) {
        return {error: {message: 'Failed to send messages'}};
    }

    const sendResponsesJson = await sendResponse.json();
    return {data: sendResponsesJson};
}
