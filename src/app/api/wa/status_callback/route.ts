import {NextRequest, NextResponse} from 'next/server'
import twilio from 'twilio';
import {SMSFormData} from '@/types';

export const dynamic = 'force-dynamic' // defaults to auto


const client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN);


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