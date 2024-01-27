import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {signUpSchema} from "@/schema";
import {formatPhone} from "@/app/(auth)/format-phone";
import {Database} from "@/supabase";
import {createErrorResponse, createSuccessResponse, HTTP_CLIENT_ERROR, HTTP_SERVER_ERROR} from "@/app/api/helper";

/**
 * Handles the POST request for user signup.
 * Validates request payload, checks user existence and invitation validity,
 * and performs user signup using Supabase.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A promise resolving to a NextResponse object.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const payload = await request.json();
    const parsed = signUpSchema.safeParse(payload);

    if (!parsed.success) {
        return createErrorResponse({
            message: "Invalid payload",
            details: parsed.error.message,
            code: 'INVALID_PAYLOAD',
        }, HTTP_CLIENT_ERROR.BAD_REQUEST);
    }

    const values = parsed.data;
    const formattedPhone = formatPhone(values.phone.number, values.phone.country);
    const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});

    const {data: userData, error: userError} = await supabase.from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .single();

    // if (userError) {
    //     return createErrorResponse({
    //         message: "Error checking user existence",
    //         details: userError.message,
    //         code: userError.code,
    //     }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    // }

    if (userData) {
        return createErrorResponse({
            message: "Phone number already registered",
            details: "User with provided phone number already exists.",
            code: 'PHONE_ALREADY_REGISTERED',
        }, HTTP_CLIENT_ERROR.CONFLICT);
    }

    const invitations = await supabase.from('invitations')
        .select('*, messages_sent(*)')
        .eq('stamp_id', values.stamp)
        .single();

    if (invitations.error) {
        return createErrorResponse({
            message: "Error checking invitation validity",
            details: invitations.error.message,
            code: invitations.error.code,
        }, invitations.status === 406 ? HTTP_CLIENT_ERROR.NOT_ACCEPTABLE : HTTP_CLIENT_ERROR.BAD_REQUEST);
    }

    if (!invitations.data) {
        return createErrorResponse({
            message: "Invitation not found",
            details: "No valid invitation found for provided stamp ID.",
            code: 'INVITATION_NOT_FOUND',
        }, HTTP_CLIENT_ERROR.NOT_FOUND);
    }

    const isPhoneNumberPermitted = invitations.data.messages_sent.some(message => message.to === `whatsapp:${formattedPhone}`);
    if (!isPhoneNumberPermitted) {
        return createErrorResponse({
            message: "Phone number not permitted for invitation",
            details: "Provided phone number does not match any number in the invitation.",
            code: 'PHONE_NOT_PERMITTED',
        }, HTTP_CLIENT_ERROR.UNAUTHORIZED);
    }

    const signUpResult = await supabase.auth.signUp({
        phone: formattedPhone,
        password: values.password,
        options: {
            channel: 'whatsapp',
            data: {
                stamp_id: values.stamp,
                whatsapp_id: formattedPhone,
                invitation_id: invitations.data.id,
            },
        },
    });

    console.log("signUpResult", signUpResult);
    console.log("signUpResult.error", signUpResult.error);

    if (signUpResult.error) {
        return createErrorResponse({
            message: "Signup process failed",
            details: signUpResult.error.message,
            code: 'SIGNUP_FAILED',
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }


    if (!signUpResult.data || !signUpResult.data.user) {
        return createErrorResponse({
            message: "Signup process failed",
            details: "No error message",
            code: 'SIGNUP_FAILED',
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }

    const userInsert = await supabase.from('users')
        .upsert({
            id: signUpResult.data.user.id,
            phone: formattedPhone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'id',
        });

    console.log("userInsert.error", userInsert.error);
    console.log("userInsert.data", userInsert.data);

    if (userInsert.error) {
        return createErrorResponse({
            message: "Error inserting public.user",
            details: userInsert.error.message,
            code: userInsert.error.code,
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }

    const roleInsert = await supabase.from('roleships')
        .upsert({
            user_id: signUpResult.data.user.id,
            role_id: invitations.data.role_id,
            invitation_id: invitations.data.id,
            station_id: invitations.data.station_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id, role_id, station_id',
        });

    console.log("roleInsert.error", roleInsert.error);
    console.log("roleInsert.data", roleInsert.data);

    if (roleInsert.error) {
        return createErrorResponse({
            message: "Error inserting public.roleships",
            details: roleInsert.error.message,
            code: roleInsert.error.code,
        }, HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR);
    }

    return createSuccessResponse({message: "User signed up successfully"});
}
