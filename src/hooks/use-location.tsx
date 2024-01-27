import {useState, useEffect} from 'react';

export const useLocation = ({
                                enableHighAccuracy = false,
                                watchPosition = false,
                                timeout = 10000,
                                enabled = false,
                                onLocationChange,
                                onError,
                                onLoadingChange
                            }: {
    enableHighAccuracy?: boolean,
    watchPosition?: boolean,
    timeout?: number,
    enabled?: boolean,
    onLocationChange?: (location: GeolocationPosition) => void,
    onError?: (error: GeolocationPositionError) => void,
    onLoadingChange?: (loading: boolean) => void,
}) => {
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocationEnabled, setLocationEnabled] = useState(enabled);

    useEffect(() => {
        let watcher: number | null = null;

        if (isLocationEnabled && navigator.geolocation) {
            setLoading(true);
            onLoadingChange?.(true);

            const successCallback = (position: GeolocationPosition) => {
                onLocationChange?.(position);
                setUserLocation(position);
                setLoading(false);
            };

            const errorCallback = (err: GeolocationPositionError) => {
                onError?.(err);
                setError(err.message);
                setLoading(false);
            };

            const options = {
                enableHighAccuracy,
                timeout,
            };

            if (watchPosition) {
                watcher = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
            } else {
                navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
            }
        }

        return () => {
            if (watcher !== null) {
                navigator.geolocation.clearWatch(watcher);
            }
        };
    }, [isLocationEnabled, enableHighAccuracy, watchPosition, timeout, onLocationChange, onError, onLoadingChange]);

    const toggleLocationEnabled = () => setLocationEnabled(prevState => !prevState);
    const enableLocation = () => setLocationEnabled(true);
    const disableLocation = () => setLocationEnabled(false);

    return {
        userLocation,
        loading,
        error,
        isLocationEnabled,
        setLocationEnabled,
        toggleLocationEnabled,
        enableLocation,
        disableLocation,
    };
}
