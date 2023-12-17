import {useState, useEffect} from 'react';

const useUserLocation = () => {
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            position => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            error => {
                setLocationError(error.message);
            },
            {enableHighAccuracy: true}
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return {userLocation, locationError};
};

export default useUserLocation;
