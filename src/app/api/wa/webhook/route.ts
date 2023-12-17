import {NextRequest, NextResponse} from 'next/server'
import {cookies} from 'next/headers'

import twilio from 'twilio';
import {SMSFormData} from '@/types';

export const dynamic = 'force-dynamic' // defaults to auto


const RESCUE_BUOY_TABLE_NAME = process.env.RESCUE_BUOY_TABLE_NAME || "rescue_buoy";


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);


// Function to validate Twilio request signature
async function isValidTwilioRequest(req: NextRequest, params: Record<any, any>): Promise<boolean> {
    const twilioSignature = req.headers.get('x-twilio-signature') as string;
    const url = `${req.nextUrl.protocol}//${req.headers.get('host')}${req.nextUrl.pathname}`;
    return twilio.validateRequest(process.env.REACT_APP_TWILIO_AUTH_TOKEN || "", twilioSignature, url, params);
}

// Regex for the id, of format XX-XXXX
const idRegex = /\d+-\d+$/;

//
import {createRouteHandlerClient} from '@supabase/auth-helpers-nextjs'
import {Database, Tables} from "@/types/supabase";


export async function POST(request: NextRequest) {

    try {
        // Parse form data
        const params = Object.fromEntries(new URLSearchParams(await request.text()));

        // Validate Twilio request signature
        if (!await isValidTwilioRequest(request, params)) {
            console.error('Invalid Twilio Signature');
            return new NextResponse('Invalid Twilio Signature', {status: 401});
        }

        const supabase = createRouteHandlerClient<Database>({cookies})


        // // Parse form data (Debugging)
        // const smsDataFormatted = JSON.stringify(params, null, 2);
        // console.log("smsDataFormatted", smsDataFormatted);
        // const responseMessage = await client.messages.create({
        //     body: `Received message: \n\`\`\`${smsDataFormatted}\`\`\``,
        //     from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
        //     to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        // })

        // regex params["Body"] for id
        console.log("params", params);
        console.log("params[Body]", params["Body"]);
        const idRegex = /\*\[(\d+-\d+)\]\*/;
        const inputString = params["Body"]; // Assuming this is your input string like '*[42-000]*'

        const match = inputString.match(idRegex);
        const id = match ? match[1] : null; // match[1] contains the first capturing group
        console.log("id", id);

        if (id) {
            const {data, error} = await supabase.from(RESCUE_BUOY_TABLE_NAME)
                .select("*")
                .eq("id", id)
                .returns<Tables<'rescue_buoy'>[]>();

            if (error) {
                console.error('Error in Twilio webhook handler:', error);
                return new NextResponse('Error in Twilio webhook handler', {status: 500});
            }

            if (!data || data.length === 0) {
                console.error('No data found');
                return new NextResponse('The provided ID was not found', {status: 404});
            }

            // Message template
            const message = `Update on *{{1}}* Rescue Buoy (ID: *{{2}}*) at *{{3}}*. Please report the current status:`;
            const messageParams: Record<string, string> = {
                1: data[0].name,
                2: data[0].id,
                3: data[0].formatted_address
            };

            // Replace placeholders in message template
            const messageBody = message.replace(/\{\{(\d+)\}\}/g, (match, p1) => messageParams[p1]);

            // Return response
            return new NextResponse(messageBody, {status: 200});

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