import {NextRequest, NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createRouteHandlerClient, SupabaseClient} from '@supabase/auth-helpers-nextjs'
import {Database, Tables} from "@/types/supabase";
import twilio from 'twilio';
import {SMSFormData} from '@/types';
import {parseTwilioRequest, isValidTwilioRequest} from "@/code/twilio";
import {convertKeysToSnakeCase} from "@/code/utils";

export const dynamic = 'force-dynamic' // defaults to auto


const RESCUE_BUOYS = process.env.RESCUE_BUOY_TABLE_NAME || `rescue_buoys`;
const MESSAGE_RECEIVED = process.env.MESSAGE_RECEIVED_TABLE_NAME || `messages_received`;
const MESSAGE_SENT = process.env.MESSAGE_SENT_TABLE_NAME || `messages_sent`;


// define base class for SendAndWaitForResponse
class SendAndWaitForResponse {

    supabase: SupabaseClient<Database>;
    client: twilio.Twilio;
    message_params: Record<string, string>;

    // variables:

    constructor(supabase: SupabaseClient<Database>, client: twilio.Twilio) {
        this.supabase = supabase;
        this.client = client;
    }

    // send message
    async sendMessage(to: string, body: string) {
        const messageResponse = await this.client.messages.create({
            body: body,
            from: `whatsapp:${SIGNAL_PHONE_NUMBER}`,
            to: to // Replace with a dynamic recipient if needed
        });

        const {data, error} = await this.supabase.from(MESSAGE_SENT)
            .insert(convertMessageSent(messageResponse))
            .single();

        // if (error) {
        //     console.error('Supabase error:', error.message);
        //     return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
        // }
        return {data, error};
    }

    // callback when response is received
    async callback() {
        // callback
    }

    // first reply when triggered
    async reply() {
        // reply
    }

    renderTemplate(template: string, params: Record<string, string>) {
        // render template
        return template.replace(/\{\{(\d+)\}\}/g, (match, p1) => params[p1]);
    }

    // used to check message content for trigger
    test(params: Record<string, string>) {
    }
}

const SIGNAL_PHONE_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || ``;

function convertMessageSent(message: MessageSentExample): MessageSent {
    return {
        body: message.body,
        num_segments: message.numSegments,
        direction: message.direction,
        from: message.from,
        to: message.to,
        date_updated: message.dateUpdated,
        price: message.price,
        error_message: message.errorMessage,
        uri: message.uri,
        account_sid: message.accountSid,
        num_media: message.numMedia,
        status: message.status,
        messaging_service_sid: message.messagingServiceSid,
        sid: message.sid,
        date_sent: message.dateSent,
        date_created: message.dateCreated,
        error_code: message.errorCode,
        price_unit: message.priceUnit,
        api_version: message.apiVersion,
        subresource_uris_media: message.subresourceUris.media,
    };
}


enum Report {
    OK = "OK",
    MISSING = "MISSING",
    USED = "USED",
    REQUIRES_ATTENTION = "REQUIRES ATTENTION"
}

import {EquipmentStatus} from "@/components/types";


class PinkRescueBuoyPlain extends SendAndWaitForResponse {

    prb_id: string;
    button_response: Report;
    button_mapping: Record<Report, EquipmentStatus> = {
        [Report.OK]: EquipmentStatus.OK,
        [Report.MISSING]: EquipmentStatus.MISSING,
        [Report.USED]: EquipmentStatus.USED,
        [Report.REQUIRES_ATTENTION]: EquipmentStatus.MAINTENANCE
    }
    template = `Update on *{{1}}* Rescue Buoy (ID: *{{2}}*) at *{{3}}*. Please report the current status below:`;
    name = "pink_rescue_buoy_plain";

    constructor(supabase: SupabaseClient<Database>, client: twilio.Twilio) {
        super(supabase, client);
    }

    async send() {
        // send message
    }

    async callback() {
        // callback
    }

    async reply() {
        const {data, error} = await this.supabase.from(RESCUE_BUOYS)
            .select("*")
            .eq("id", this.prb_id)
            .returns<Tables<RESCUE_BUOYS>[]>();

        if (error) {
            console.error('Supabase error:', error.message);
            return new NextResponse(`Supabase error: ${error.message} [${error.code}]`, {status: 500});
        }

        if (!data || data.length === 0) {
            console.error('No data found');
            return new NextResponse('The provided ID was not found', {status: 404});
        }

        const messageBody = this.renderTemplate(this.template, {
            1: data[0].name,
            2: data[0].id,
            3: data[0].formatted_address
        });

        const {send_data, send_error} = await this.sendMessage(this.message_params["from"], messageBody);
        if (send_error) {
            console.error('Supabase error:', send_error.message);
            return new NextResponse(`Supabase error: ${send_error.message} [${send_error.code}]`, {status: 500});
        }

        // const messageResponse = await client.messages.create({
        //     body: messageBody,
        //     from: `whatsapp:${SIGNAL_PHONE_NUMBER}`,
        //     to: `${this.message_params["from"]}` // Replace with a dynamic recipient if needed
        // });
        //
        // // console.log("messageResponse", messageResponse);
        // // const message_response = convertKeysToSnakeCase(messageResponse);
        //
        //
        // const {data: response_data, error: response_error} = await supabase.from(MESSAGE_SENT)
        //     .insert(convertMessageSent(messageResponse))
        //     .single();
        //
        // if (response_error) {
        //     console.error('Supabase error:', response_error.message);
        //     return new NextResponse(`Supabase error: ${response_error.message}`, {status: 500});
        // }

    }

    regexID(inputString: string) {
        const idRegex = /(\d+-\d+)/;
        const match = inputString.match(idRegex);
        console.log("match", match);
        return match ? match[1] : null; // match[1] contains the first capturing group
    }

    parseID(inputString: string | null) {
        if (!inputString) {
            return null;
        }
        const idParts = inputString.split("-");
        return `${idParts[0].padStart(2, "0")}-${idParts[1].padStart(4, "0")}`;
    }

    test(params: Record<string, string>): boolean {
        const rawID = this.regexID(params["body"]);
        console.log("rawID", rawID);
        this.prb_id = this.parseID(rawID);
        console.log("this.prb_id", this.prb_id);
        this.message_params = params
        return this.prb_id !== null;
    }
}


// // create an array of handlers
// const handlers = [
//     new PinkRescueBuoyHandler(supabase, client),
//     // add more handlers here
// ];
//
//
// export async function POST(request: NextRequest) {
//     try {
//         // Parse form data
//         const twilioParams = await parseTwilioRequest(request);
//
//         // Validate Twilio request signature
//         if (!await isValidTwilioRequest(request, twilioParams)) {
//             console.error('Invalid Twilio Signature');
//             return new NextResponse('Invalid Twilio Signature', {status: 401});
//         }
//
//
//         // Insert into 'received_messages' table
//         const params = convertKeysToSnakeCase(twilioParams); // Convert keys to snake case
//         const {data, error} = await supabase.from('received_message')
//             .insert(params);
//         if (error) {
//             console.error('Supabase error:', error);
//             return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
//         }
//
//         // check each handler to see if it can handle the message
//         for (let handler of handlers) {
//             if (handler.test(params)) {
//                 // if the handler can handle the message, let it do so
//                 await handler.reply();
//                 return new NextResponse("", {status: 200});
//             }
//         }
//
//         // if no handler can handle the message, return an error
//         console.error('No handler found');
//         return new NextResponse('No handler found', {status: 404});
//     } catch (error) { // Catch all errors
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//         console.error('Error in Twilio webhook handler:', errorMessage);
//         return new NextResponse(errorMessage, {status: 500});
//     }
// }

export async function POST(request: NextRequest) {
    // Create Supabase client
    const supabase = createRouteHandlerClient<Database>({cookies})
    // Create Twilio client
    const client = twilio(
        process.env.REACT_APP_TWILIO_ACCOUNT_SID,
        process.env.REACT_APP_TWILIO_AUTH_TOKEN);

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
        const {data, error} = await supabase.from(MESSAGE_RECEIVED)
            .insert(params);
        if (error) {
            console.error('Supabase error:', error);
            return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
        }

        console.log("params", params);

        // regex params["Body"] for id
        // const idRegex = /(\d+-\d+)/;
        // const inputString = params["body"]; // Assuming this is your input string like '*[42-000]*'
        //
        // const match = inputString.match(idRegex);
        // let id = match ? match[1] : null; // match[1] contains the first capturing group

        // enum Report {
        //     OK = "OK",
        //     MISSING = "MISSING",
        //     USED = "USED",
        //     REQUIRES_ATTENTION = "REQUIRES ATTENTION"
        // }

        const handlers = [
            new PinkRescueBuoyPlain(supabase, client),
            // add more handlers here
        ];

        for (let handler of handlers) {
            console.log("handler.test(params)", handler.test(params));
            if (handler.test(params)) {
                // if the handler can handle the message, let it do so
                await handler.reply();
                return new NextResponse("", {status: 200});
            }
        }

        // if (message_template.test(params)) {
        //
        //     // format id. XX-YYYY. XX must be padded as 2 with 0's and YYYY must be padded as 4 with 0's
        //     const idParts = id.split("-");
        //     id = `${idParts[0].padStart(2, "0")}-${idParts[1].padStart(4, "0")}`;
        //
        //     const {data, error} = await supabase.from(RESCUE_BUOYS)
        //         .select("*")
        //         .eq("id", id)
        //         .returns<Tables<RESCUE_BUOYS>[]>();
        //
        //     if (error) {
        //         console.error('Supabase error:', error.message);
        //         return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
        //     }
        //
        //     if (!data || data.length === 0) {
        //         console.error('No data found');
        //         return new NextResponse('The provided ID was not found', {status: 404});
        //     }
        //
        //     // Message template
        //     const message = `Update on *{{1}}* Rescue Buoy (ID: *{{2}}*) at *{{3}}*. Please report the current status below:`;
        //
        //     const messageParams: Record<string, string> = {
        //         1: data[0].name,
        //         2: data[0].id,
        //         3: data[0].formatted_address
        //     };
        //
        //     // Replace placeholders in message template
        //     const messageBody = message.replace(/\{\{(\d+)\}\}/g, (match, p1) => messageParams[p1]);
        //
        //     // Return response
        //     // return new NextResponse(messageBody, {status: 200});
        //     const messageResponse = await client.messages.create({
        //         body: messageBody,
        //         // persistentAction: [`geo:${data[0].lat},${data[0].lng}|${data[0].formatted_address}`],
        //         from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
        //         to: `${params["from"]}` // Replace with a dynamic recipient if needed
        //     });
        //
        //     const {data: response_data, error: response_error} = await supabase.from(MESSAGE_SENT)
        //         .insert(messageResponse)
        //         .single();
        //
        //     if (response_error) {
        //         console.error('Supabase error:', response_error.message);
        //         return new NextResponse(`Supabase error: ${response_error.message}`, {status: 500});
        //     }
        //
        //     return new NextResponse("", {status: 200});
        //
        //     // if button_text is in params, then we need to send a message with buttons
        // } else if (params["button_text"]) {
        //
        //     // const {data, error} = await supabase.from('messages_sent')
        //     //     .select("*")
        //     //     .eq("id", params["original_replied_message_sid"])
        //     //     .returns<Tables<'messages_sent'>[]>();
        //     //
        //     // if (error) {
        //     //     console.error('Supabase error:', error.message);
        //     //     return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
        //     // }
        //     //
        //     // if (!data || data.length === 0) {
        //     //     console.error('No data found');
        //     //     return new NextResponse('The provided ID was not found', {status: 404});
        //     // }
        //     //
        //     // const original_message = data[0];
        //     //
        //     // callback(original_message, params["button_text"]);
        //     //
        //     // return new NextResponse("", {status: 200});


        // } else {
        //     // debug with all data and info of regex. Return with a response of 200, which goes to whatspp
        //     console.error('No ID found');
        //     return new NextResponse('The provided ID was not found', {status: 200});
        // }


        // await client.messages.create({
        //     body: messageBody,
        //     from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
        //     to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        // })

        // Send response
        return new NextResponse('', {status: 200});

    } catch (error) { // Catch all errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in Twilio webhook handler:', errorMessage);
        return new NextResponse(errorMessage, {status: 500});
    }
}