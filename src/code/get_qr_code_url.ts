import {QRArguments} from '@/types';
import {getBaseUrl} from "@/code/domain";

export function getQRCodeURL({
                          data,
                          size = 300,
                          format = 'svg',
                          color = '0-0-0', // default red color
                          bgcolor = '255-255-255', // default white background
                          charset = 'UTF-8',
                          ecc = 'L',
                          margin = 0,
                          qzone = 0
                      }: QRArguments): string {
    const baseUrl = `${getBaseUrl()}/api/qr/custom`; // Replace with your actual base URL
    const queryParams = new URLSearchParams();

    queryParams.append('data', data);
    queryParams.append('size', size.toString());
    queryParams.append('format', format);
    if (color) queryParams.append('color', color);
    if (bgcolor) queryParams.append('bgcolor', bgcolor);
    if (charset) queryParams.append('charset', charset);
    if (ecc) queryParams.append('ecc', ecc);
    if (margin) queryParams.append('margin', margin.toString());
    if (qzone) queryParams.append('qzone', qzone.toString());

    return `${baseUrl}?${queryParams.toString()}`;
}