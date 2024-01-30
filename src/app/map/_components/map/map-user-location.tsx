import React, {useContext, useEffect, useMemo} from "react";
import {AdvancedMarker, useMap} from "@vis.gl/react-google-maps";
import useGeolocation from "@/hooks/use-geolocation";
import {actionTypes, AppContext} from "@/app/app";

// Type for location data
type LocationData = {
    latitude: number;
    longitude: number;
    accuracy?: number;
    isUser?: boolean; // Flag to identify if it's the user's location
};

function UserErrorCircle({userLocation, userLocationError, map}: {
    userLocation: google.maps.LatLngLiteral,
    userLocationError: number,
    map: google.maps.Map | null
}) {
    const circleRef = React.useRef<google.maps.Circle | null>(null);

    useEffect(() => {
        circleRef.current = new google.maps.Circle({
            strokeColor: "#002aff",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#002AFFFF",
            fillOpacity: 0.1,
            center: userLocation,
            radius: userLocationError
        });
    }, []);

    useEffect(() => {
        if (!circleRef.current) return;
        circleRef.current.setCenter(userLocation);
        circleRef.current.setRadius(userLocationError);
    }, [userLocation, userLocationError]);

    useEffect(() => {
        if (!map || !userLocation || !circleRef.current) return;
        circleRef.current.setMap(map);
        return () => {
            circleRef.current && circleRef.current.setMap(null)
        };
    }, [map]);

    return null;
}


const MapUserLocation = ({geolocation}: { geolocation: GeolocationPosition }) => {
    const map = useMap();
    return (
        <>
            {geolocation.coords.latitude && geolocation.coords.longitude && (
                <AdvancedMarker position={{
                    lat: geolocation.coords.latitude,
                    lng: geolocation.coords.longitude
                }}>
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
                        {geolocation.coords.accuracy && (
                            <UserErrorCircle
                                userLocation={{lat: geolocation.coords.latitude, lng: geolocation.coords.longitude}}
                                userLocationError={geolocation.coords.accuracy}
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
