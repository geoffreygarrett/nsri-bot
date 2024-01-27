"use client";

import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    APIProvider,
    Map as BaseMap,
} from '@vis.gl/react-google-maps';
import {useIdle} from "@uidotdev/usehooks";

import {MapContextMenu} from "@/components/map-context/map-context-menu";
import {useTheme} from "next-themes";
import {MapProvider, useMapContext} from "@/components/map-context/map-context";
import MapLoading from "@/app/map/loading";
import {AppContext, AppProvider} from "@/app/map/map";
import {InfoWindowProvider} from "@/app/map/_components/integrations/google-maps/draw/info-window/info-window-context";
import {InfoWindow} from "@/app/map/_components/integrations/google-maps/draw/info-window/info-window";
import {useFps} from "@/hooks/use-fps";
import {toast} from "sonner";
import useTimeout from "@/hooks/use-timeout";

const Map = React.memo(BaseMap);

const DARK_RASTER_MAP_ID = 'ca29dbf0633b6ee9'
const DARK_VECTOR_MAP_ID = '6b52a341154682a5'
const LIGHT_RASTER_MAP_ID = 'a6ef439e871dcbb2'
const LIGHT_VECTOR_MAP_ID = '192722c95c08b0b5'



const _MapContainer = ({children}: { children: React.ReactNode }) => {

    const {resolvedTheme} = useTheme();
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const defaultCenter = {lat: -30, lng: 25};
    const defaultZoom = 6;
    const [rasterMapId, setRasterMapId] = useState<string>(resolvedTheme === 'dark' ? DARK_RASTER_MAP_ID : LIGHT_RASTER_MAP_ID);
    const [vectorMapId, setVectorMapId] = useState<string>(resolvedTheme === 'dark' ? DARK_VECTOR_MAP_ID : LIGHT_VECTOR_MAP_ID);
    useEffect(() => {
        setTilesLoaded(false)
        setRasterMapId(resolvedTheme === 'dark' ? DARK_RASTER_MAP_ID : LIGHT_RASTER_MAP_ID);
        setVectorMapId(resolvedTheme === 'dark' ? DARK_VECTOR_MAP_ID : LIGHT_VECTOR_MAP_ID);
    }, [resolvedTheme])
    const [tilesLoaded, setTilesLoaded] = useState(false);
    const handleContextMenu = (event: any) => {
        console.log('contextmenu', event);
        triggerRef.current?.dispatchEvent(new CustomEvent('mapcontextmenu', {
            bubbles: true,
            cancelable: true,
            detail: {
                lat: event.detail.latLng.lat,
                lng: event.detail.latLng.lng,
                clientX: event.domEvent.x,
                clientY: event.domEvent.y,
            }
        }));
    };

    const restriction = {
        latLngBounds: {
            north: -5,
            south: -50,
            east: 45,
            west: 5
        },
        strictBounds: true
    }

    const {state, dispatch} = useContext(AppContext);
    // const idle = useIdle(500);
    // const fps = useFps();
    const fps = 30;
    const [dragging, setDragging] = useState(false);

    const handleDragStart = () => setDragging(true);
    const handleDragEnd = () => setDragging(false);

    //
    //
    // useEffect(() => {
    //     if (!idle && dragging && fps < 15 && !state.settings.toggles.enable_performance_mode.enabled) {
    //         toast("Performance issue", {
    //             description: "Performance issue detected. Enable performance mode?",
    //             action: {
    //                 label: "Enable",
    //                 onClick: () => dispatch({type: 'TOGGLE_SETTING', payload: "enable_performance_mode"})
    //             },
    //         })
    //     }
    // }, [idle, dragging, fps, state.settings.toggles.enable_performance_mode.enabled, dispatch]); // React to changes in idle, dragging, or fps state



    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} version="beta">
            <MapProvider>
                <MapLoading
                    className="h-full w-full absolute top-0 z-10 focus:outline-none"
                    tilesLoaded={tilesLoaded}
                    animate={true}/>
                <MapContextMenu triggerRef={triggerRef}/>
                <Map zoom={defaultZoom}
                     maxZoom={35}
                     onTilesLoaded={() => setTilesLoaded(true)}
                     clickableIcons={false}
                     restriction={restriction}
                     // onIdle={(event: any) => {
                     //     console.log('idle', event)
                     // }}
                     // onDragstart={handleDragStart}
                     // onDragend={handleDragEnd}
                     onContextmenu={handleContextMenu}
                     center={defaultCenter}
                     mapId={vectorMapId}
                     gestureHandling="greedy"
                     fullscreenControl={false}
                     keyboardShortcuts={false}
                     zoomControl={false}
                     streetViewControl={false}
                     mapTypeControl={false}
                     backgroundColor={'transparent'}
                     className="h-full w-full absolute top-0 focus:outline-none">
                    <InfoWindowProvider>
                        {children}
                        <InfoWindow/>
                    </InfoWindowProvider>
                </Map>
            </MapProvider>
        </APIProvider>
    )
}

const MapContainer = React.memo(_MapContainer);
MapContainer.displayName = 'MapContainer';

export default function MapLayout({
                                      children,
                                  }: {
    children: React.ReactNode
}) {

    return (
        <AppProvider>
            <MapContainer>
                {children}
            </MapContainer>
        </AppProvider>
    )
}