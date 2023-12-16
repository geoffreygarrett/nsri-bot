import {NextRequest, NextResponse} from 'next/server';
import {QRArguments as QRRequestData} from '@/types';

function buildQRCodeURL({data, size, format, color, bgcolor, charset, ecc, margin, qzone}: QRRequestData): string {
    console.log("data", data);
    let url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}&format=${format}`;

    if (color) url += `&color=${encodeURIComponent(color)}`;
    if (bgcolor) url += `&bgcolor=${encodeURIComponent(bgcolor)}`;
    if (charset) url += `&charset-source=${charset}&charset-target=${charset}`;
    if (ecc) url += `&ecc=${ecc}`;
    if (margin) url += `&margin=${margin}`;
    if (qzone) url += `&qzone=${qzone}`;

    return url;
}

async function callQRCodeService(requestBody: QRRequestData): Promise<Blob> {
    const url = buildQRCodeURL(requestBody);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`QR code generation failed with status ${response.status}`);
        }
        return response.blob();
    } catch (error) {
        console.error(`Error in callQRCodeService: ${error}`);
        throw error;
    }
}

function validateRequestBody(body: QRRequestData) {
    if (!body.data) {
        throw new Error("The 'data' field is required");
    }
    if (!body.size || body.size < 10 || body.size > 1000) {
        throw new Error("Invalid 'size' value");
    }
}
type ImageFormat = 'png' | 'gif' | 'jpeg' | 'jpg' | 'svg' | 'eps';

function getContentType(format: ImageFormat): string {
    const formatToContentType: { [key in ImageFormat]: string } = {
        'png': 'image/png',
        'gif': 'image/gif',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'eps': 'application/postscript'
    };

    return formatToContentType[format];
}

export async function GET(request: NextRequest) {
    try {
        const urlParams = new URL(request.url).searchParams;

        // Mandatory parameter
        const data = urlParams.get('data');
        if (!data) {
            return new NextResponse("Missing 'data' query parameter", {status: 400});
        }

        // Optional parameters with defaults or undefined
        const size = parseInt(urlParams.get('size') || '200');
        const format = (urlParams.get('format') as QRRequestData['format']) || 'png';
        const color = urlParams.get('color') || undefined;
        const bgcolor = urlParams.get('bgcolor') || undefined;
        const charset = (urlParams.get('charset') as QRRequestData['charset']) || undefined;
        const ecc = (urlParams.get('ecc') as QRRequestData['ecc']) || undefined;
        const margin = urlParams.has('margin') ? parseInt(urlParams.get('margin')!) : undefined;
        const qzone = urlParams.has('qzone') ? parseInt(urlParams.get('qzone')!) : undefined;

        const qrRequestData: QRRequestData = {data, size, format, color, bgcolor, charset, ecc, margin, qzone};

        // Assuming validateRequestBody and callQRCodeService functions are defined
        validateRequestBody(qrRequestData);

        const qrCodeResponse = await callQRCodeService(qrRequestData);
        const contentType = getContentType(qrRequestData.format);

        return new NextResponse(qrCodeResponse, {
            status: 200,
            headers: {'Content-Type': contentType}
        });
    } catch (error: unknown) {
        // Narrow down the type from `unknown` to an `Error` instance
        if (error instanceof Error) {
            console.error(`Error in GET request: ${error.message}`);
            return new NextResponse(`Error: ${error.message}`, {status: 400});
        } else {
            // If it's not an `Error` instance, handle it as a generic error without specific properties
            console.error('Error in GET request: An unknown error occurred.');
            return new NextResponse('Error: An unknown error occurred.', {status: 400});
        }
    }
}
