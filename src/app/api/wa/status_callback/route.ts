import {NextRequest, NextResponse} from 'next/server'
import twilio from 'twilio';
import {SMSFormData} from '@/types';
import {isValidTwilioRequest, parseTwilioRequest} from "@/code/twilio";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {cookies} from "next/headers";
import {convertKeysToSnakeCase} from "@/code/utils";

// export const dynamic = 'force-dynamic' // defaults to auto


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);

const RESCUE_BUOYS = process.env.RESCUE_BUOY_TABLE_NAME || `rescue_buoys`;
const MESSAGES_STATUS_UPDATES = process.env.MESSAGES_STATUS_UPDATES_TABLE_NAME || `messages_status_updates`;
const MESSAGES_SENT = process.env.MESSAGES_SENT_TABLE_NAME || `messages_sent`;

export async function POST(request: NextRequest) {


    try {
        // Parse form data
        const twilioParams = await parseTwilioRequest(request);

        // Validate Twilio request signature
        if (!await isValidTwilioRequest(request, twilioParams)) {
            console.error('Invalid Twilio Signature');
            return new NextResponse('Invalid Twilio Signature', {status: 401});
        }

        // Create Supabase client
        const supabase = createRouteHandlerClient<Database>({cookies})

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

        const {error} = await supabase
            .from(MESSAGES_SENT)
            .update(update_keys)
            .eq(`sid`, params.message_sid)

        if (error) {
            console.error('Supabase error:', error);
            return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
        }

        const {data: data2, error: error2} = await supabase
            .from(MESSAGES_STATUS_UPDATES)
            .insert([params])


        // console.log(`Message sent with SID: ${responseMessage.sid}`);
        return new NextResponse('Message status update received successfully', {status: 200});
    } catch (error: unknown) {
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