"use server";

import twilio from "twilio";
import {SendMessageType} from "@/server/types";

export const sendWhatsApp: SendMessageType = async (message, phoneNumber) => {
    const client = twilio(
        process.env.REACT_APP_TWILIO_ACCOUNT_SID,
        process.env.REACT_APP_TWILIO_AUTH_TOKEN
    );

    try {
        const messageResponse = await client.messages.create({
            body: message,
            from: `whatsapp:${process.env.REACT_APP_TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${phoneNumber}`
        });
        console.log(messageResponse.sid);
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        throw error; // Re-throw the error for the caller to handle if needed
    }
};
