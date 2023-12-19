// Function to validate Twilio request signature
import {NextRequest} from "next/server";
import twilio from "twilio";

export async function isValidTwilioRequest(req: NextRequest, params: Record<any, any>): Promise<boolean> {
    const twilioSignature = req.headers.get('x-twilio-signature') as string;
    const url = `${req.nextUrl.protocol}//${req.headers.get('host')}${req.nextUrl.pathname}`;
    return twilio.validateRequest(process.env.REACT_APP_TWILIO_AUTH_TOKEN || "", twilioSignature, url, params);
}

export const parseTwilioRequest = async (request: NextRequest): Promise<Record<string, string>> => {
    return Object.fromEntries(new URLSearchParams(await request.text()));
}
