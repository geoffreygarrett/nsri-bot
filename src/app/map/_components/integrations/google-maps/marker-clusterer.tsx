"use client";

import {useContext, useEffect, useRef, useState, createContext, useCallback} from "react";
import {MarkerClusterer as CoreMarkerClusterer} from "@googlemaps/markerclusterer";
import {GoogleMapsContext} from "@vis.gl/react-google-maps";
import {MarkerClustererOptions} from "@googlemaps/markerclusterer/dist/markerclusterer";
import AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

// 1. Clusterer Context
export interface GoogleMapsMarkerClustererContextValue {
    clusterer: CoreMarkerClusterer | null;
    isEnabled: boolean;
    isFinalized?: boolean;
    setIsFinalized?: (isFinalized: boolean) => void;
    addMarker?: (marker: google.maps.Marker | AdvancedMarkerElement) => void;
    removeMarker?: (marker: google.maps.Marker | AdvancedMarkerElement) => void;
}

export const GoogleMapsMarkerClustererContext = createContext<GoogleMapsMarkerClustererContextValue | null>(null);

type MarkerClustererProps = Omit<MarkerClustererOptions, 'map'> & {
    children?: React.ReactNode;
    enabled?: boolean;
    addMarker?: (marker: google.maps.Marker | AdvancedMarkerElement) => void;
    finalize?: () => void;
};

// 2. Clusterer Provider Component
const MarkerClusterer: React.FC<MarkerClustererProps> = ({
                                                             algorithm,
                                                             algorithmOptions,
                                                             renderer,
                                                             onClusterClick,
                                                             enabled = true,
                                                             children
                                                         }) => {
    const clustererRef = useRef<CoreMarkerClusterer | null>(null);
    const map = useContext(GoogleMapsContext)?.map;
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [markers, setMarkers] = useState<(google.maps.Marker | AdvancedMarkerElement)[]>([]);

    const addMarker = useCallback((marker: google.maps.Marker | AdvancedMarkerElement) => {
        setMarkers(prevMarkers => [...prevMarkers, marker]);
    }, []);

    const removeMarker = useCallback((marker: google.maps.Marker | AdvancedMarkerElement) => {
        setMarkers(prevMarkers => prevMarkers.filter(m => m !== marker));
    }, []);

    // Redraw clusterer when markers change
    useEffect(() => {
        if (!clustererRef.current) return;
        if (!isEnabled) return;
        clustererRef.current.addMarkers(markers);
        return () => {
            clustererRef.current?.clearMarkers();
        }
    }, [markers, map, isEnabled]);

    // Update the enabled state
    useEffect(() => {
        setIsEnabled(enabled);
    }, [enabled]);

    // Initialize the clusterer
    useEffect(() => {
        if (clustererRef.current) return;
        clustererRef.current = new CoreMarkerClusterer({
            algorithm,
            algorithmOptions,
            renderer,
            onClusterClick
        });

        return () => {
            clustererRef.current?.clearMarkers();
            clustererRef.current = null;
        };
    }, [algorithm, algorithmOptions, renderer, onClusterClick]);

    // Set the map for the clusterer
    useEffect(() => {
        if (!map || !enabled || !clustererRef.current) return;
        console.log(`Setting map for clusterer`);
        clustererRef.current.setMap(map);
        clustererRef.current.render();
        return () => {
            console.log(`Removing map for clusterer`);
            clustererRef.current?.setMap(null);
        };
    }, [map, enabled]);

    return (
        <GoogleMapsMarkerClustererContext.Provider
            value={{clusterer: clustererRef.current, isEnabled, addMarker, removeMarker}}>
            {children}
        </GoogleMapsMarkerClustererContext.Provider>
    );
};

export default MarkerClusterer;