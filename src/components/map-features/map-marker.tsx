"use client";

import React, {ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Marker, MarkerClusterer} from "@googlemaps/markerclusterer";
import {
    useMap,
    Marker as NormalMarker,
    AdvancedMarker as OriginalMarker,
    useAdvancedMarkerRef, useMarkerRef, useMapsLibrary
} from '@vis.gl/react-google-maps';

import {InfoWindow} from "@/components/map-features/info-window";
import {AdvancedMarker, AdvancedMarkerRef} from "@/app/map/_components/integrations/google-maps/draw/advanced-marker";

import {IMarker} from "@/components/types";
import ItemInfoWindowContent from "@/components/map_info_window";
import {useTheme} from "next-themes";
import {toast} from "sonner";
import {useInfoWindowContext} from "@/app/map/_components/integrations/google-maps/info-window-provider";
import {debounce} from "next/dist/server/utils";
import {AppContext} from "@/app/app";
import MapMouseEvent = google.maps.MapMouseEvent;
import {Point} from "geojson";

// Wrap AdvancedMarker in React.memo
// const AdvancedMarker = React.memo(OriginalMarker);
// const AdvancedMarker = OriginalMarker;

// Function to convert latitude to an integer zIndex
function latToZIndex(lat: number) {
    // Adjust the scale factor as needed for your application
    const scaleFactor = 10000;
    return Math.round(Math.abs(lat) * scaleFactor);
}

type MarkerData = {
    id: string | number;
    location: Point;
}

type MarkerItem<T> = T & MarkerData;


type MarkerProps<T> = {
    item: MarkerItem<T>;
    children?: React.ReactNode;
    onMarkerClick?: (
        event: MapMouseEvent,
        marker: google.maps.marker.AdvancedMarkerElement,
        item: MarkerItem<T>) => void;
    render: (props: {
        item: MarkerItem<T>,
        marker: google.maps.marker.AdvancedMarkerElement | null,
        markerRef: (m: AdvancedMarkerRef) => void
    }) => React.ReactNode;
    // onInfoWindowToggle?: (id: string) => void;
    // isInfoWindowOpen?: boolean;
    show?: boolean;
};

const MyMarker = <T extends MarkerData>({
                                            children,
                                            onMarkerClick,
                                            item,
                                            render,
                                        }: MarkerProps<T>) => {

        const [markerRef, marker] = useAdvancedMarkerRef();

        return (
            <>
                {render({item, marker, markerRef})}
            </>
        );
    }
;

export default MyMarker;