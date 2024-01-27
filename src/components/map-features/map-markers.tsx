"use client";

import React, {useMemo, useState} from "react";
import MyMarker from "@/components/map-features/map-marker";
import {Marker as NormalMarker} from '@vis.gl/react-google-maps';
import {IMarker} from "@/components/types";
import {AdvancedMarkerRef} from "@/app/map/_components/integrations/google-maps/draw/advanced-marker";
import {Point} from "geojson";
import MapMouseEvent = google.maps.MapMouseEvent;

// Wrap AdvancedMarker in React.memo
const AdvancedMarker = NormalMarker;

type GlyphFunctionType = (props: {
    point: IMarker,
    colorFunction?: (point: IMarker) => {
        background: string,
        border: string
    }
}) => React.ReactNode;


type MarkerData = {
    id: string | number;
    location: Point;
}

type MarkerItem<T> = T & MarkerData;

type MarkersProps<T> = {
    items: MarkerItem<T>[];
    onMarkerClick?: (
        event: MapMouseEvent,
        marker: google.maps.marker.AdvancedMarkerElement,
        item: MarkerItem<T>) => void;
    triggerRef?: React.MutableRefObject<HTMLDivElement | null>;
    render: (props: {
        item: MarkerItem<T>,
        marker: google.maps.marker.AdvancedMarkerElement | null,
        markerRef: (m: AdvancedMarkerRef) => void
    }) => React.ReactNode,
};


const Markers = <T extends MarkerData>({
                                           items,
                                           onMarkerClick,
                                           render,
                                       }: MarkersProps<T>) => {

    const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);

    // Memoize markers to avoid re-rendering all markers when placemarks array changes
    const markerElements = useMemo(() => {
        return items.map((item: MarkerItem<T>,) => (
            <MyMarker
                key={item.id.toString()}
                item={item}
                onMarkerClick={onMarkerClick}
                render={render}
                // onInfoWindowToggle={() => {
                //     handleInfoWindowToggle(item.id?.toString());
                // }}
                // isInfoWindowOpen={openInfoWindowId === item.id?.toString()}
            />
        ));
    }, [items, render, onMarkerClick]);

    return <>{markerElements}</>;
};

export default Markers;