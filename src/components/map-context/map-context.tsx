"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import {useApiIsLoaded, useMap} from "@vis.gl/react-google-maps";
import {useTheme} from "next-themes";


// Define the type for context state
type MapContextType = {
    apiIsLoaded: boolean;
    mapInitialized: boolean;
};

// Create context with default values
const MapContext = createContext<MapContextType>({
    apiIsLoaded: false,
    mapInitialized: false,
});

export const useMapContext: () => MapContextType = () => useContext(MapContext);

// export default function SupabaseProvider({children, initialSession}: {
//     children: React.ReactNode
export function MapProvider({children}: {
    children: React.ReactNode
}) {
    const [mapInitialized, setMapInitialized] = useState(false); // [1
    const apiIsLoaded = useApiIsLoaded();
    const map = useMap();
    const {theme} = useTheme()

    useEffect(() => {
        console.log('map context apiIsLoaded', apiIsLoaded);
        if (apiIsLoaded && map) {
            setMapInitialized(true);
            return () => {
                setMapInitialized(false);
            }
        }
    }, [apiIsLoaded, map])


    return (
        <MapContext.Provider value={{apiIsLoaded, mapInitialized}}>
            {children}
        </MapContext.Provider>
    );
};
