import {useState, useEffect} from 'react';

const useGeolocationPosition = ({enabled = true, highAccuracy = true}: {
    enabled?: boolean,
    highAccuracy?: boolean
} = {}) => {
    const [geolocationError, setGeolocationError] = useState<GeolocationPositionError | null>(null);
    const [geolocationPosition, setGeolocationPosition] = useState<GeolocationPosition | null>(null);

    useEffect(() => {
        if (!enabled) {
            setGeolocationPosition(null);
            setGeolocationError(null);
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            position => {
                setGeolocationPosition(position);
            },
            error => {
                setGeolocationError(error);
            },
            {enableHighAccuracy: highAccuracy}
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [enabled, highAccuracy]);

    return {geolocationPosition, geolocationError};
};

export default useGeolocationPosition;
