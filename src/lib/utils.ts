import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {toast} from "sonner";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export function formatDD(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

export const convertToDMS = (deg: number, latOrLong: 'lat' | 'long'): string => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

    let direction = '';
    if (latOrLong === 'lat') direction = deg >= 0 ? 'N' : 'S';
    if (latOrLong === 'long') direction = deg >= 0 ? 'E' : 'W';

    return `${degrees}°${minutes}'${seconds}"${direction}`;
};

export function formatDMS(latitude: number, longitude: number, separator = ', '): string {
    return `${convertToDMS(latitude, 'lat')}${separator}${convertToDMS(longitude, 'long')}`;
}

export const convertToDMM = (deg: number, latOrLong: 'lat' | 'long'): string => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutes = ((absolute - degrees) * 60).toFixed(4);

    let direction = '';
    if (latOrLong === 'lat') direction = deg >= 0 ? 'N' : 'S';
    if (latOrLong === 'long') direction = deg >= 0 ? 'E' : 'W';

    return `${degrees} ${minutes} ${direction}`;
};

export function formatDMM(latitude: number, longitude: number, separator = ', '): string {
    return `${convertToDMM(latitude, 'lat')}${separator}${convertToDMM(longitude, 'long')}`;
}

export const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
        // Modern approach with Clipboard API
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Copied to clipboard");
        }, (err) => {
            toast.error("Failed to copy to clipboard");
        });
    } else {
        // Fallback for older browsers or HTTP sites
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                toast.success("Copied to clipboard");
            } else {
                toast.error("Failed to copy to clipboard");
            }
        } catch (err) {
            toast.error("Failed to copy to clipboard");
        }
        document.body.removeChild(textArea);
    }
}