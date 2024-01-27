// Function to validate Twilio request signature
import {NextRequest, NextResponse} from "next/server";
import twilio from "twilio";
import {convertKeysToSnakeCase} from "@/code/utils";
import {SendPayloadSchema} from "@/schema";
import {z} from "zod";
import {Tables, TablesInsert} from "@/types/supabase";
import {MessageInstance, MessageListInstanceCreateOptions} from "twilio/lib/rest/api/v2010/account/message";

export async function isValidTwilioRequest(req: NextRequest, params: Record<any, any>): Promise<boolean> {
    const twilioSignature = req.headers.get('x-twilio-signature') as string;
    const url = `${req.nextUrl.protocol}//${req.headers.get('host')}${req.nextUrl.pathname}`;
    return twilio.validateRequest(process.env.REACT_APP_TWILIO_AUTH_TOKEN || "", twilioSignature, url, params);
}

export const parseTwilioRequest = async (request: NextRequest): Promise<Record<string, string>> => {
    return Object.fromEntries(new URLSearchParams(await request.text()));
}

export const parseAndValidateTwilioRequest = async (request: NextRequest) => {
    // Parse form data
    const twilioParams = await parseTwilioRequest(request);

    // Validate Twilio request signature
    if (!await isValidTwilioRequest(request, twilioParams)) {
        console.error('Invalid Twilio Signature');
        return new NextResponse('Invalid Twilio Signature', {status: 401});
    }
    return convertKeysToSnakeCase(twilioParams);
}

interface AdditionalMessageFields {
    invitationId?: string;
}

export function convertMessageListOptionsAndInstance(
    {
        create,
        response
    }:
        {
            create: MessageListInstanceCreateOptions & AdditionalMessageFields
            response: MessageInstance
        }
): TablesInsert<'messages_sent'> {
    const message = response.toJSON();

    return {
        // Fields from MessageListInstanceCreateOptions
        to: create.to,
        status_callback: create.statusCallback ? create.statusCallback : null,
        application_sid: create.applicationSid ? create.applicationSid : null,
        max_price: create.maxPrice ? create.maxPrice.toString() : null,
        provide_feedback: create.provideFeedback ? create.provideFeedback : null,
        attempt: create.attempt ? create.attempt : null,
        validity_period: create.validityPeriod ? create.validityPeriod : null,
        force_delivery: create.forceDelivery ? create.forceDelivery : null,
        content_retention: create.contentRetention ? create.contentRetention : null,
        address_retention: create.addressRetention ? create.addressRetention : null,
        smart_encoded: create.smartEncoded ? create.smartEncoded : null,
        persistent_action: create.persistentAction ? create.persistentAction : null,
        shorten_urls: create.shortenUrls ? create.shortenUrls : null,
        schedule_type: create.scheduleType ? create.scheduleType : null,
        send_at: create.sendAt ? create.sendAt.toISOString() : null,
        send_as_mms: create.sendAsMms ? create.sendAsMms : null,
        content_variables: create.contentVariables ? create.contentVariables : null,
        risk_check: create.riskCheck ? create.riskCheck : null,
        from: create.from ? create.from : null,
        messaging_service_sid: create.messagingServiceSid ? create.messagingServiceSid : null,
        body: create.body ? create.body : "",
        media_url: create.mediaUrl ? create.mediaUrl : null,
        content_sid: create.contentSid ? create.contentSid : null,

        // Additional fields from AdditionalMessageFields
        invitation_id: create.invitationId ? create.invitationId : null,

        // Fields from MessageInstance
        num_segments: message.numSegments,
        direction: message.direction,
        date_updated: message.dateUpdated.toISOString(),
        price: message.price,
        error_message: message.errorMessage,
        uri: message.uri,
        account_sid: message.accountSid,
        num_media: message.numMedia,
        status: message.status,
        sid: message.sid,
        date_sent: message.dateSent ? message.dateSent.toISOString() : null,
        date_created: message.dateCreated.toISOString(),
        error_code: message.errorCode ? message.errorCode.toString() : null,
        price_unit: message.priceUnit,
        api_version: message.apiVersion,
        subresource_uris_media: message.subresourceUris?.media,
    };
}


export function convertMessageInstance(response: MessageInstance) {
    const message = response.toJSON();
    return {
        body: message.body,
        num_segments: message.numSegments,
        direction: message.direction,
        from: message.from,
        to: message.to,
        date_updated: message.dateUpdated.toISOString(),
        price: message.price,
        error_message: message.errorMessage,
        uri: message.uri,
        account_sid: message.accountSid,
        num_media: message.numMedia,
        status: message.status,
        messaging_service_sid: message.messagingServiceSid,
        sid: message.sid,
        date_sent: message.dateSent.toISOString(),
        date_created: message.dateCreated.toISOString(),
        error_code: message.errorCode.toString(),
        price_unit: message.priceUnit,
        api_version: message.apiVersion,
        subresource_uris_media: message.subresourceUris?.media,
    };
}
