import {NextRequest, NextResponse} from 'next/server'
import twilio from 'twilio';
import {SMSFormData} from '@/types';

export const dynamic = 'force-dynamic' // defaults to auto


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);


// Function to validate Twilio request signature
async function isValidTwilioRequest(req: NextRequest, params: Record<any, any>): Promise<boolean> {
    const twilioSignature = req.headers.get('x-twilio-signature') as string;
    const url = `${req.nextUrl.protocol}//${req.headers.get('host')}${req.nextUrl.pathname}`;
    return twilio.validateRequest(process.env.REACT_APP_TWILIO_AUTH_TOKEN || "", twilioSignature, url, params);
}


export async function POST(request: NextRequest) {
    try {
        // Parse form data
        const params = Object.fromEntries(new URLSearchParams(await request.text()));

        // Validate Twilio request signature
        if (!await isValidTwilioRequest(request, params)) {
            console.error('Invalid Twilio Signature');
            return new NextResponse('Invalid Twilio Signature', {status: 401});
        }

        // Parse form data (Debugging)
        const smsDataFormatted = JSON.stringify(params, null, 2);
        console.log("smsDataFormatted", smsDataFormatted);
        const responseMessage = await client.messages.create({
            body: `Received message: \n\`\`\`${smsDataFormatted}\`\`\``,
            from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
            to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        })


        // Message template
        const message = `Update on *{{1}}* Rescue Buoy (ID: *{{2}}*) at *{{3}}*. Please report the current status:`;
        const messageParams: Record<string, string> = {
            1: "Palmiet Bridge",
            2: "KLEI-0004",
            3: "Palmietrivier, Kleinmond"
        };
        const messageBody = message.replace(/\{\{(\d+)\}\}/g, (match, p1) => messageParams[p1]);
        await client.messages.create({
            body: messageBody,
            from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
            to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        })

        // Send response
        return new NextResponse('Webhook processed successfully', {status: 200});

    } catch (error) { // Catch all errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in Twilio webhook handler:', errorMessage);
        return new NextResponse(errorMessage, {status: 500});
    }
}