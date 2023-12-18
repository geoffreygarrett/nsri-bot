import {NextRequest, NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createRouteHandlerClient} from '@supabase/auth-helpers-nextjs'
import {Database, Tables} from "@/types/supabase";
import twilio from 'twilio';
import {SMSFormData} from '@/types';

export const dynamic = 'force-dynamic' // defaults to auto


const RESCUE_BUOY_TABLE_NAME = process.env.RESCUE_BUOY_TABLE_NAME || "rescue_buoy";


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);


// const TWILIO_ACCOUNT_SID = process.env.REACT_APP_TWILIO_ACCOUNT_SID || 'your_twilio_account_sid'; // Replace with your Account SID
// const TWILIO_AUTH_TOKEN = process.env.REACT_APP_TWILIO_AUTH_TOKEN || 'your_twilio_auth_token'; // Replace with your Auth Token
//
// const headers = new Headers();
// headers.append('Content-Type', 'application/json');
// headers.append('Authorization', 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`));

// const body2 = JSON.stringify({
//     "friendly_name": "owl_coupon_card",
//     "language": "en",
//     "variables": {
//         "1": "coupon_code"
//     },
//     "types": {
//         "whatsapp/card": {
//             "body": "Congratulations, you have reached Elite status! Add code {{1}} for 10% off.",
//             "header_text": "This is a {{1}} card",
//             "footer": "To unsubscribe, reply Stop",
//             "actions": [
//                 {
//                     "url": "https://twilio.com/",
//                     "title": "Order Online",
//                     "type": "URL"
//                 },
//                 {
//                     "phone": "+15551234567",
//                     "title": "Call Us",
//                     "type": "PHONE_NUMBER"
//                 }
//             ]
//         }
//     }
// });


// Function to validate Twilio request signature
async function isValidTwilioRequest(req: NextRequest, params: Record<any, any>): Promise<boolean> {
    const twilioSignature = req.headers.get('x-twilio-signature') as string;
    const url = `${req.nextUrl.protocol}//${req.headers.get('host')}${req.nextUrl.pathname}`;
    return twilio.validateRequest(process.env.REACT_APP_TWILIO_AUTH_TOKEN || "", twilioSignature, url, params);
}

function isPlainObject(obj: any) {
    return obj && typeof obj === 'object' && obj.constructor === Object;
}


function toSnakeCase(str: string): string {
    return str
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
}

function convertKeysToSnakeCase(obj: any, depth = 0, seen = new WeakSet()): any {
    if (depth > 10) { // Set a reasonable limit to recursion depth
        return obj;
    }

    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (seen.has(obj)) {
        // Circular reference detected
        return obj;
    }
    seen.add(obj);

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToSnakeCase(item, depth + 1, seen));
    }

    return Object.keys(obj).reduce((result: any, key: string) => {
        const newKey = toSnakeCase(key);
        result[newKey] = convertKeysToSnakeCase(obj[key], depth + 1, seen);
        return result;
    }, {});
}


export async function POST(request: NextRequest) {

    // fetch('https://content.twilio.com/v1/Content', { method: 'POST', headers: headers, body: body2 })
    //     .then(response => response.json())
    //     .then(data => console.log(data))
    //     .catch(error => console.error('Error:', error));


    try {
        // Parse form data
        const rawParams = Object.fromEntries(new URLSearchParams(await request.text()));

        // Validate Twilio request signature
        if (!await isValidTwilioRequest(request, rawParams)) {
            console.error('Invalid Twilio Signature');
            return new NextResponse('Invalid Twilio Signature', {status: 401});
        }

        // Convert keys to snake case
        const params = convertKeysToSnakeCase(rawParams);
        console.log("params", params);

        // Create Supabase client
        const supabase = createRouteHandlerClient<Database>({cookies})
        // Insert into 'received_messages' table
        const {data, error} = await supabase.from('received_message').insert(params);
        if (error) {
            console.error('Supabase error:', error);
            return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
        }


        // // Parse form data (Debugging)
        // const smsDataFormatted = JSON.stringify(params, null, 2);
        // console.log("smsDataFormatted", smsDataFormatted);
        // const responseMessage = await client.messages.create({
        //     body: `Received message: \n\`\`\`${smsDataFormatted}\`\`\``,
        //     from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
        //     to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        // })

        // regex params["Body"] for id
        const idRegex = /(\d+-\d+)/;
        const inputString = params["body"]; // Assuming this is your input string like '*[42-000]*'

        const match = inputString.match(idRegex);
        let id = match ? match[1] : null; // match[1] contains the first capturing group

        // if params["ReplyMessage"] {
        //     console.log("ReplyMessage", params["ReplyMessage"]);
        // }

        if (id) {

            // format id. XX-YYYY. XX must be padded as 2 with 0's and YYYY must be padded as 4 with 0's
            const idParts = id.split("-");
            id = `${idParts[0].padStart(2, "0")}-${idParts[1].padStart(4, "0")}`;

            const {data, error} = await supabase.from(RESCUE_BUOY_TABLE_NAME)
                .select("*")
                .eq("id", id)
                .returns<Tables<'rescue_buoy'>[]>();

            if (error) {
                console.error('Supabase error:', error.message);
                return new NextResponse(`Supabase error: ${error.message}`, {status: 500});
            }

            if (!data || data.length === 0) {
                console.error('No data found');
                return new NextResponse('The provided ID was not found', {status: 404});
            }

            // Message template
            const message = `Update on *{{1}}* Rescue Buoy (ID: *{{2}}*) at *{{3}}*. Please report the current status below:`;

            enum Report {
                OK = "OK",
                MISSING = "MISSING",
                USED = "USED",
                REQUIRES_ATTENTION = "REQUIRES ATTENTION"
            }

            const messageParams: Record<string, string> = {
                1: data[0].name,
                2: data[0].id,
                3: data[0].formatted_address
            };

            // Replace placeholders in message template
            const messageBody = message.replace(/\{\{(\d+)\}\}/g, (match, p1) => messageParams[p1]);

            // Return response
            // return new NextResponse(messageBody, {status: 200});
            await client.messages.create({
                body: messageBody,
                // persistentAction: [`geo:${data[0].lat},${data[0].lng}|${data[0].formatted_address}`],
                from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
                to: `${params["from"]}` // Replace with a dynamic recipient if needed
            }).catch((error) => {
                console.error('Twilio error:', error.message);
                return new NextResponse(`Twilio error: ${error.message}`, {status: 500});
            }).then((message) => {
                const processedMessage = convertKeysToSnakeCase(message);
                console.log(processedMessage);
            });

            // Convert to snake case
            // const sentMessageParams = convertKeysToSnakeCase(sentMessage);

            // console.log(`Message sent: ${sentMessageParams}`);

            return new NextResponse("", {status: 200});


        } else {
            // debug with all data and info of regex. Return with a response of 200, which goes to whatspp
            console.error('No ID found');
            return new NextResponse('The provided ID was not found', {status: 200});
        }


        // await client.messages.create({
        //     body: messageBody,
        //     from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
        //     to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        // })

        // Send response
        // return new NextResponse(messageBody, {status: 200});

    } catch (error) { // Catch all errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in Twilio webhook handler:', errorMessage);
        return new NextResponse(errorMessage, {status: 500});
    }
}