export interface BaseMessage {
    sms_message_sid: string;
    num_media: string;
    profile_name: string;
    sms_sid: string;
    wa_id: string;
    sms_status: string;
    body: string;
    to: string;
    num_segments: string;
    referral_num_media: string;
    message_sid: string;
    account_sid: string;
    from: string;
    api_version: string;
}

export interface MediaMessage extends BaseMessage {
    media_content_type0: string;
    media_url0: string;
}

export interface LocationMessage extends BaseMessage {
    latitude: string;
    longitude: string;
}

export interface ButtonMessage extends BaseMessage {
    button_text: string;
    button_payload: string;
}

export function isMediaMessage(message: BaseMessage): message is MediaMessage {
    return 'media_content_type0' in message && 'media_url0' in message;
}

function isLocationMessage(message: BaseMessage): message is LocationMessage {
    return 'latitude' in message && 'longitude' in message;
}

