import {NextResponse} from "next/server";

/**
 * Enum for HTTP Informational Responses.
 */
export enum HTTP_INFORMATIONAL {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    EARLY_HINTS = 103,
}

/**
 * Enum for HTTP Success Responses.
 */
export enum HTTP_SUCCESS {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,
}

/**
 * Enum for HTTP Redirection Responses.
 */
export enum HTTP_REDIRECTION {
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
}

/**
 * Enum for HTTP Client Error Responses.
 */
export enum HTTP_CLIENT_ERROR {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    CONTENT_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_CONTENT = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
}

/**
 * Enum for HTTP Server Error Responses.
 */
export enum HTTP_SERVER_ERROR {
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
}

/**
 * Type for HTTP Status Codes.
 */
export type HTTP_STATUS_CODE =
    HTTP_INFORMATIONAL |
    HTTP_SUCCESS |
    HTTP_REDIRECTION |
    HTTP_CLIENT_ERROR |
    HTTP_SERVER_ERROR;

/**
 * Type definition for ErrorReturn.
 */
export type Error = {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
};

/**
 * Type definition for Return.
 */
export type Return = {
    data?: any | null;
    error?: Error | null;
};

/**
 * Creates a structured error response conforming to the ErrorReturn type.
 *
 * @param {Error} error - The error object.
 * @param {number} [status=400] - HTTP status code (default is 400).
 * @returns {NextResponse} - A NextResponse object with error details and status code.
 */
export const createErrorResponse = (error: Error, status: HTTP_STATUS_CODE = HTTP_CLIENT_ERROR.BAD_REQUEST): NextResponse => {
    return new NextResponse(JSON.stringify({
        error,
        data: null,
    } as Return), {
        status,
        headers: {'Content-Type': 'application/json'},
    });
};

/**
 * Creates a structured success response.
 *
 * @param {any} data - The response data.
 * @param {number} [status=200] - HTTP status code (default is 200).
 * @returns {NextResponse} - A NextResponse object with the data and status code.
 */
export const createSuccessResponse = (data: any, status: HTTP_STATUS_CODE = HTTP_SUCCESS.OK): NextResponse => {
    return new NextResponse(JSON.stringify({
        error: null,
        data,
    } as Return), {
        status,
        headers: {'Content-Type': 'application/json'},
    });
}
