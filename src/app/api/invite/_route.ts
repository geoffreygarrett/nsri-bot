import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Database, Tables} from "@/types/supabase";
import {cookies} from "next/headers";
import {getBaseUrl, getExternalIp} from "@/code/domain";
import {InvitationFormValues} from "@/app/(dash)/invite/_components/invitation-form";
import ShortUniqueId from "short-unique-id";
import {ApiLogger, LoggingMode} from "@/app/api/logger";

const WA_SEND_ENDPOINT = `/api/wa/send`;
const THIS_ENDPOINT = `/api/invite`;

export async function POST(request: NextRequest) {
    const supabase: SupabaseClient<Database> = createRouteHandlerClient<Database>({cookies});
    const apiLogger = new ApiLogger(supabase, LoggingMode.All, 1, THIS_ENDPOINT);
    const invitation: InvitationFormValues = await request.json();

    const user = await supabase.auth.getUser();
    if (!user.data || user.error) return new NextResponse('Unauthorized', {status: 401});

    const uid = new ShortUniqueId();
    const shortIdLength = 10;
    const validHours = 24;
    const validDuration = validHours * 60 * 60 * 1000;
    const createdAt = new Date();

    // Get a proxied object for 'invitations' table
    const invitationInsertPayload = {
        created_by_id: user.data.user?.id,
        role_id: invitation.role,
        station_id: Number(invitation.station_id),
        note: invitation.note,
        stamp_id: uid.stamp(shortIdLength, new Date(Date.now() + validDuration)),
        updated_at: createdAt.toISOString(),
        created_at: createdAt.toISOString(),
    }
    const invitationInsertStartTime = new Date();
    const invitationInsertResponse = await supabase.from('invitations')
        .insert(invitationInsertPayload)
        .select(`*, roles ( * )`)
        .single()
        .then((response) => {
            apiLogger.logSupabaseOperation(
                'invitations',
                'INSERT',
                invitationInsertStartTime,
                response,
                invitationInsertPayload
            );
            return response;
        })


    if (invitationInsertResponse.error) {
        console.error('Failed to insert invitations: ', invitationInsertResponse.error);
        return new NextResponse('Failed to insert invitations', {status: 500});
    }

    const externalIP = await getExternalIp();

    const messagePayload = invitation.numbers.map((number: string) => ({
        to: `whatsapp:${number}`,
        from: "MGe78fadf418b09d3df1924001b5007712",
        contentSid: 'HXc0f4fcc8fcb3c7c24fb2b9bc88876757',
        statusCallback: `http://${externalIP}:8080/api/wa/status_callback`,
        contentVariables: JSON.stringify({
            1: `${invitationInsertResponse.data.id}?phone=${number}`.replace("+", ""),
            2: `Station ${invitationInsertResponse.data.station_id} (${invitationInsertResponse.data.roles!.name})`,
            3: `${validHours.toString()} hours`,
        }),
    }));

    const sendInvitationResponse = await apiLogger.logFetch(`${getBaseUrl()}${WA_SEND_ENDPOINT}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(messagePayload)
    });

    if (!sendInvitationResponse.ok) {
        return new NextResponse('Failed to send invitations', {status: 500});
    }

    const sendInvitationResponsesJson = await sendInvitationResponse.json();

    // Get a proxied object for 'invitations_sent' table
    // Now, you can use the standard Supabase chaining operations on this proxy
    const invitationsSentStartTime = new Date();
    const invitationsSentPayload = sendInvitationResponsesJson.map((message: Tables<'messages_sent'>) => ({
        invitation_id: invitationInsertResponse.data!.id,
        message_id: message.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));
    // async logSupabaseOperation(table: string, method: string, startTime: Date, response: PostgrestResponse<any>, payload: any) {
    const invitationsSentInsertResponse = await supabase.from('invitations_sent')
        .insert(invitationsSentPayload)
        .select()
        .then((response) => {
            apiLogger.logSupabaseOperation(
                'invitations_sent',
                'INSERT',
                invitationsSentStartTime,
                response,
                invitationsSentPayload
            );
            return response;
        })


    if (invitationsSentInsertResponse.error) {
        console.error('Failed to insert invitations sent: ', invitationsSentInsertResponse.error);
        return new NextResponse('Failed to insert invitations sent', {status: 500});
    }

    await apiLogger.flush();

    return new NextResponse(JSON.stringify({
        invitations: invitationInsertResponse.data,
        invitations_sent: invitationsSentInsertResponse.data,
        messages_sent: sendInvitationResponsesJson,
    }), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });
}
