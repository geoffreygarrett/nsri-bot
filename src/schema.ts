import * as z from "zod";
import {CountryCallingCode, CountryCode, isPossiblePhoneNumber, isValidPhoneNumber, parse} from "libphonenumber-js";
import {BuoyStatus} from "@/types/temp";

// State for pin
const e164Regex = new RegExp("^\\+[1-9]\\d{1,14}$");

//
const validateE164 = (number: string): boolean => {
    return number.match(e164Regex) !== null;
}

export const phoneShape = z.string()
    .refine(isPossiblePhoneNumber, "Invalid phone number. Please use a valid phone number.")
    // .refine(validateE164, "Invalid phone number format. Please use E.164 format. Example: +27821234567");
    .refine(parse, "Invalid phone number.");


export const intlPhoneNumber = z.object(
    {
        country: z.enum(['AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TA', 'TC', 'TD', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW']),
        number: z.string(),
    }
).refine((obj) => {
    return isValidPhoneNumber(obj.number, obj.country as CountryCode)
}, "Invalid phone number.");

export const signUpSchema = z.object({
    phone: intlPhoneNumber,
    password: z.string()
        .min(8)
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    stamp: z.string(),
});


// Convert enum values to a tuple type
const buoyStatusValues = Object.values(BuoyStatus) as [BuoyStatus, ...BuoyStatus[]];

export const buoyStatusEnum = z.enum(buoyStatusValues);
const MAX_FILE_SIZE = 10000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const rescueBuoySchema = z.object({
    id: z.string().optional(),
    station_id: z.number().optional(), // Assuming station ID is a number
    description: z.string().optional(),
    buoy_id: z.coerce.number().optional(), // Assuming buoy ID is a number
    name: z.string().min(1, "Buoy name is required"),
    lat: z.coerce.number().min(-90).max(90, "Invalid latitude value"),
    lng: z.coerce.number().min(-180).max(180, "Invalid longitude value"),
    alt: z.coerce.number().optional(), // Assuming altitude can be optional
    old_id: z.string().optional(),
    status: buoyStatusEnum,
    image_url: z.string().url().optional(),
    image: z
        .any()
        .refine(
            (file) => {
                if (!file) return true;
                return file?.size <= MAX_FILE_SIZE
            }, `Max image size is 10MB.`)
        .refine(
            (file) => {
                if (!file) return true;
                return ACCEPTED_IMAGE_TYPES.includes(file?.type)
            },
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        ).optional(),


    // metadata: z.preprocess(
    //     (arg: any) => {
    //         if (typeof arg === 'string' || typeof arg === 'undefined') {
    //             try {
    //                 return JSON.parse(arg);
    //             } catch {
    //                 return {};
    //             }
    //         }
    //         return arg;
    //     },
    //     z.record(z.any()) // Assumes metadata is a JSON object
    // ),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
    deleted_at: z.date().optional()
});

// Usage example
// const buoyData = { ... }; // Your buoy data here
// const parsedData = rescueBu


export const signInSchema = z.object({
    phone: intlPhoneNumber,
    password: z.string().min(8),
});

export const invitationSchema = z.object({
    role: z.string(),
    station_id: z.coerce.number().optional(),
    numbers: z.array(phoneShape).min(1, "Please enter at least one phone number."),
    note: z.string().optional(),
})


// SEND API ENDPOINT
export const SendPayloadSchema = z.object({
    // MessageListInstanceCreateOptions
    to: z.string(),
    statusCallback: z.string().optional(),
    applicationSid: z.string().optional(),
    maxPrice: z.number().optional(),
    provideFeedback: z.boolean().optional(),
    attempt: z.number().optional(),
    validityPeriod: z.number().min(1).max(14400).optional(),
    forceDelivery: z.boolean().optional(),
    contentRetention: z.enum(['retain', 'discard'] as const).optional(),
    addressRetention: z.enum(["retain", "obfuscate"]).optional(),
    smartEncoded: z.boolean().optional(),
    persistentAction: z.array(z.string()).optional(),
    shortenUrls: z.boolean().optional(),
    scheduleType: z.enum(['fixed'] as const).optional(),
    sendAt: z.date().optional(),
    sendAsMms: z.boolean().optional(),
    contentVariables: z.string().optional(),
    riskCheck: z.enum(['enable', 'disable'] as const).optional(),
    from: z.string().optional(),
    messagingServiceSid: z.string().optional(),
    body: z.string().max(1600).optional(),
    mediaUrl: z.array(z.string()).optional(),
    contentSid: z.string().optional(),

    // Database specific
    invitationId: z.string().optional(),
});


export const SendPayloadListSchema = z.array(SendPayloadSchema);