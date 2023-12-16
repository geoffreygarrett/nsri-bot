export async function reverse_geocode(lat: number, lng: number, api_key: string): Promise<string> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${api_key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        } else {
            throw new Error('No address found for the given coordinates.');
        }
    } catch (error) {
        console.error('Error in reverse geocoding:', error);
        throw error;
    }
}