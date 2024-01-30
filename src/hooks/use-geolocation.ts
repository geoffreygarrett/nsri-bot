import {useState, useEffect} from "react";

export default function useGeolocation(options: PositionOptions = {}, enabled: boolean = true) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<GeolocationPositionError | null>(null);
    const [data, setData] = useState<GeolocationPosition | null>(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        } else {
            setLoading(true);
        }

        const successHandler = (e: GeolocationPosition) => {
            setLoading(false);
            setError(null);
            setData(e);
        };

        const errorHandler = (e: GeolocationPositionError) => {
            setError(e);
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            options
        );

        const id = navigator.geolocation.watchPosition(
            successHandler,
            errorHandler,
            options
        );

        return () => navigator.geolocation.clearWatch(id);
    }, [options, enabled]);

    return {loading, error, data};
}
