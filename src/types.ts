export type QRArguments = {
    data: string;
    size: number;
    format: 'png' | 'gif' | 'jpeg' | 'jpg' | 'svg' | 'eps';
    color?: string;
    bgcolor?: string;
    charset?: 'ISO-8859-1' | 'UTF-8';
    ecc?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    qzone?: number;
};


export type SMSFormData = {
    SmsMessageSid: string;
    NumMedia: string;
    ProfileName: string;
    SmsSid: string;
    WaId: string;
    SmsStatus: string;
    Body: string;
    To: string;
    NumSegments: string;
    ReferralNumMedia: string;
    MessageSid: string;
    AccountSid: string;
    From: string;
    ApiVersion: string;
};