import {NextRequest, NextResponse} from 'next/server'
import twilio from 'twilio';

export const dynamic = 'force-dynamic' // defaults to auto


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);


type SMSFormData = {
    SmsMessageSid: string;
    NumMedia: string;
    ProfileName: string;
    SmsSid: string;
    WaId: string;
    SmsStatus: 'received' | 'queued' | 'sent' | 'failed' | 'delivered' | 'undelivered'; // Adjust as per your use case
    Body: string;
    To: string;
    NumSegments: string;
    ReferralNumMedia: string;
    MessageSid: string;
    AccountSid: string;
    From: string;
    ApiVersion: string;
};

const parseFormData = (formData: FormData): SMSFormData => {
    const smsData: Partial<SMSFormData> = {}; // Use Partial for intermediate state
    formData.forEach((value, key) => {
        smsData[key as keyof SMSFormData] = value.toString();
    });
    return smsData as SMSFormData; // Cast to SMSFormData after assigning all properties
};

const validateSMSFormData = (smsData: SMSFormData) => {
    // Implement your validation logic here
    // ...
    // throw new Error('Invalid data');
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const smsData = parseFormData(formData);
        validateSMSFormData(smsData);

        const smsDataFormatted = JSON.stringify(smsData, null, 2);
        console.log("smsDataFormatted (status)", smsDataFormatted);
        // const responseMessage = await client.messages.create({
        //     body: `Received message: \n\`\`\`${smsDataFormatted}\`\`\``,
        //     from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER}`,
        //     to: 'whatsapp:+31646275883' // Replace with a dynamic recipient if needed
        // });

        // console.log(`Message sent with SID: ${responseMessage.sid}`);
        return new NextResponse('Message sent successfully', {status: 200});
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return new NextResponse(`Error: ${error.message}`, {status: 400});
    }
}