import {NextRequest, NextResponse} from 'next/server'
import twilio from 'twilio';
import {SMSFormData} from '@/types';
import {isValidTwilioRequest, parseTwilioRequest} from "@/code/twilio";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {cookies} from "next/headers";
import {convertKeysToSnakeCase} from "@/code/utils";
import {ApiLogger, LoggingMode} from "@/app/api/logger";

// export const dynamic = 'force-dynamic' // defaults to auto


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);

const RESCUE_BUOYS = process.env.RESCUE_BUOY_TABLE_NAME || `rescue_buoys`;
const MESSAGES_STATUS_UPDATES = process.env.MESSAGES_STATUS_UPDATES_TABLE_NAME || `messages_status_updates`;
const MESSAGES_SENT = process.env.MESSAGES_SENT_TABLE_NAME || `messages_sent`;

export async function POST(request: NextRequest) {

    // Create Supabase client
    const supabase = createRouteHandlerClient<Database>({cookies});
    const apiLogger = new ApiLogger(supabase, LoggingMode.All, 1, '/api/wa/status_callback'); // Adjust the endpoint as needed

    try {
        // Parse form data
        const twilioParams = await parseTwilioRequest(request);

        // Validate Twilio request signature
        if (!await isValidTwilioRequest(request, twilioParams)) {
            console.error('Invalid Twilio Signature');
            return new NextResponse('Invalid Twilio Signature', {status: 401});
        }

        // Insert into 'received_messages' table
        const params = convertKeysToSnakeCase(twilioParams); // Convert keys to snake case

        let update_keys = {};
        if (params.message_status === 'sent') {
            update_keys = {
                message_status: params.message_status,
                sent_at: new Date()
            }
        } else if (params.message_status === 'delivered') {
            update_keys = {
                message_status: params.message_status,
                delivered_at: new Date()
            }
        } else if (params.message_status === 'read') {
            update_keys = {
                message_status: params.message_status,
                read_at: new Date()
            }
        }

        // Insert/update into 'messages_sent' table
        const updateStartTime = new Date(); // Log the start time
        const updateResult = await supabase
            .from(MESSAGES_SENT)
            .update(update_keys)
            .eq(`sid`, params.message_sid)
            .then((response) => {
                // Log the operation
                apiLogger.logSupabaseOperation(MESSAGES_SENT, 'UPDATE', updateStartTime, response, response.error);
                return response;
            });

        if (updateResult.error) {
            console.error('Supabase error:', updateResult.error);
            return new NextResponse(`Supabase error: ${updateResult.error.message}`, {status: 500});
        }

        // Insert into 'messages_status_updates' table
        const insertStartTime = new Date(); // Log the start time
        const insertResult = await supabase
            .from(MESSAGES_STATUS_UPDATES)
            .insert([params])
            .then((response) => {
                // Log the operation
                apiLogger.logSupabaseOperation(MESSAGES_STATUS_UPDATES, 'INSERT', insertStartTime, response, response.error);
                return response;
            });

        if (insertResult.error) {
            console.error('Supabase error:', insertResult.error);
            return new NextResponse('Failed to insert message status updates', {status: 500});
        }

        await apiLogger.flush();

        // console.log(`Message sent with SID: ${responseMessage.sid}`);
        return new NextResponse('Message status update received successfully', {status: 200});
    } catch (error: unknown) {
        await apiLogger.flush();

        // We need to narrow the error type
        if (error instanceof Error) {
            // Now TypeScript knows `error` is of type Error, so `message` is available
            console.error(`Error occurred: ${error.message}`);
            return new NextResponse(`Error: ${error.message}`, {status: 400});
        } else {
            // If it's not an Error instance, we can handle it as a generic error
            console.error('An unknown error occurred.');
            return new NextResponse('An unknown error occurred.', {status: 400});
        }
    }
}