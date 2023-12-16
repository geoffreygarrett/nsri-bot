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
