import {AdvancedMarker, useMap} from "@vis.gl/react-google-maps";
import React, {useEffect} from "react";
import {useLocation} from "../../../../../dev/location-provider";

function UserErrorCircle({userLocation, userLocationError, map}: {
    userLocation: google.maps.LatLngLiteral,
    userLocationError: number,
    map: google.maps.Map | null
}) {
    useEffect(() => {
        if (!map || !userLocation) return;

        const newCircle = new google.maps.Circle({
            strokeColor: "#002aff",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#002AFFFF",
            fillOpacity: 0.1,
            map: map,
            center: userLocation,
            radius: userLocationError
        });

        return () => newCircle.setMap(null);
    }, [map, userLocation, userLocationError]);

    return null;
}


const MapUserLocation = ({userLocation}: { userLocation: GeolocationPosition | null }) => {
    const map = useMap();

    // Convert user location to LatLngLiteral
    const location = userLocation ? {
        lat: userLocation.coords.latitude,
        lng: userLocation.coords.longitude
    } : null;

    const locationError = userLocation ? userLocation.coords.accuracy : null;

    return (
        <>
            {location && (
                <AdvancedMarker position={location}>
                    <div className="relative flex justify-center items-center w-full h-full translate-y-1/2">
                        {/* SVG Icon (front) */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
                             className="w-5 h-5 z-20 opacity-60 animate-pulse">
                            <path fillRule="evenodd"
                                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                  clipRule="evenodd"/>
                        </svg>


                        {/* Pulsating Circle (behind) */}
                        <div
                            className="h-5 w-5 bg-blue-700 rounded-full animate-pulse border border-blue-800 absolute"></div>

                        {/* Error Circle (behind) - Adjust size based on error */}
                        {locationError && (
                            <UserErrorCircle
                                userLocation={location}
                                userLocationError={locationError}
                                map={map}
                            />
                        )}
                    </div>
                </AdvancedMarker>
            )}
        </>
    );
}

export default React.memo(MapUserLocation);  // Optimization to prevent unnecessary re-renders
