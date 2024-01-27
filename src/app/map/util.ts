export function latToZIndex(lat: number, scale: number=10000): number {
    // Adjust the scale factor as needed for your application
    return Math.round(Math.abs(lat-90) * scale);
}