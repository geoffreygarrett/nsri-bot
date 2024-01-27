"use client";

import React, {createContext, useContext, useState, useEffect} from 'react';

// Type definitions for context
type LocationContextType = {
    userLocation: GeolocationPosition | null;
    loading: boolean;
    error: string | null;
    isLocationEnabled: boolean;
    toggleLocationEnabled: () => void;
    enableLocation: () => void;
    disableLocation: () => void;
    setLocationEnabled: (enabled: boolean) => void;
};

const LocationContext = createContext<LocationContextType>({
    userLocation: null,
    loading: false,
    error: null,
    isLocationEnabled: false,
    toggleLocationEnabled: () => {
    },
    enableLocation: () => {
    },
    disableLocation: () => {
    },
    setLocationEnabled: (enabled: boolean) => {
    }
});

export const useLocation = () => useContext(LocationContext);

export default function LocationProvider({
                                             children,
                                             enableHighAccuracy = false,
                                             watchPosition = false,
                                             timeout = 10000,
                                             enabled = false,
                                         }: {
    children: React.ReactNode,
    enableHighAccuracy?: boolean,
    watchPosition?: boolean,
    timeout?: number,
    enabled?: boolean,
}) {
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocationEnabled, setLocationEnabled] = useState(enabled);

    const toggleLocationEnabled = () => {
        setLocationEnabled(prevState => !prevState);
    };

    const enableLocation = () => {
        setLocationEnabled(true);
    };

    const disableLocation = () => {
        setLocationEnabled(false);
    };

    useEffect(() => {
        let watcher: number | null = null;
        if (isLocationEnabled && navigator.geolocation) {
            setLoading(true);

            const successCallback = (position: GeolocationPosition) => {
                setUserLocation(position);
                setLoading(false);
            };

            const errorCallback = (err: GeolocationPositionError) => {
                setError(err.message);
                setLoading(false);
            };

            const options = {
                enableHighAccuracy: enableHighAccuracy,
                timeout: timeout,
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
    }, [isLocationEnabled, enableHighAccuracy, watchPosition, timeout]);

    return (
        <LocationContext.Provider value={{
            userLocation,
            loading,
            error,
            isLocationEnabled,
            toggleLocationEnabled,
            enableLocation,
            disableLocation,
            setLocationEnabled
        }}>
            {children}
        </LocationContext.Provider>
    );
}
