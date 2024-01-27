"use client";

/* eslint-disable complexity */
import React, {
    Children,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useState
} from 'react';

import {createPortal} from 'react-dom';
import type {Ref, PropsWithChildren} from 'react';
import {
    GoogleMapsContextValue,
    GoogleMapsContext,
} from "@vis.gl/react-google-maps";
import {
    useMapsLibrary
} from "@vis.gl/react-google-maps";
import {
    GoogleMapsMarkerClustererContext,
    GoogleMapsMarkerClustererContextValue
} from "@/app/map/_components/integrations/google-maps/marker-clusterer";

export interface AdvancedMarkerContextValue {
    marker: google.maps.marker.AdvancedMarkerElement;
}

export const AdvancedMarkerContext =
    React.createContext<AdvancedMarkerContextValue | null>(null);

type AdvancedMarkerEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
};

export type AdvancedMarkerProps = PropsWithChildren<
    Omit<google.maps.marker.AdvancedMarkerElementOptions, 'gmpDraggable'> &
    AdvancedMarkerEventProps & {
    /**
     * className to add a class to the advanced marker element
     * Can only be used with HTML Marker content
     */
    className?: string;
    draggable?: boolean;
}
>;

export type AdvancedMarkerRef = google.maps.marker.AdvancedMarkerElement | null;

function useAdvancedMarker(props: AdvancedMarkerProps) {
    const [marker, setMarker] =
        useState<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [contentContainer, setContentContainer] =
        useState<HTMLDivElement | null>(null);

    const map = useContext<GoogleMapsContextValue | null>(GoogleMapsContext)?.map;
    const clusterer = useContext<GoogleMapsMarkerClustererContextValue | null>(GoogleMapsMarkerClustererContext)?.clusterer;
    const clustererEnabled = useContext<GoogleMapsMarkerClustererContextValue | null>(GoogleMapsMarkerClustererContext)?.isEnabled;
    const clustererIsFinalized = useContext<GoogleMapsMarkerClustererContextValue | null>(GoogleMapsMarkerClustererContext)?.isFinalized;
    const clustererSetIsFinalized = useContext<GoogleMapsMarkerClustererContextValue | null>(GoogleMapsMarkerClustererContext)?.setIsFinalized;
    const clustererAddMarker = useContext<GoogleMapsMarkerClustererContextValue | null>(GoogleMapsMarkerClustererContext)?.addMarker;
    const clustererRemoveMarker = useContext<GoogleMapsMarkerClustererContextValue | null>(GoogleMapsMarkerClustererContext)?.removeMarker;
    const markerLibrary = useMapsLibrary('marker');

    const {
        children,
        className,
        onClick,
        onDrag,
        onDragStart,
        onDragEnd,
        collisionBehavior,
        draggable,
        position,
        title,
        zIndex
    } = props;

    const numChilds = Children.count(children);

    // create marker instance and add it to the map when map becomes available
    useEffect(() => {
        if (!markerLibrary) return;
        const newMarker = new markerLibrary.AdvancedMarkerElement();
        setMarker(newMarker);
        console.log("Marker created");

        // create container for marker content if there are children
        if (numChilds > 0) {
            const el = document.createElement('div');
            if (className) el.className = className;
            newMarker.content = el;
            setContentContainer(el);
        }

        return () => {
            console.log("Marker destroyed");
            setMarker(null);
            setContentContainer(null);
        };
    }, [markerLibrary, numChilds, className]);

    // Add marker to clusterer when it becomes available, or map if no clusterer
    useEffect(() => {
        if (!map || !marker || clustererEnabled) return;
        console.log("Adding marker to map");
        marker.map = map;
        return () => {
            console.log(`Removing marker from map`);
            marker.map = null;
        }
    }, [map, marker, clustererEnabled]);

    // Add marker to clusterer when it becomes available, or map if no clusterer
    useEffect(() => {
        if (!marker || !clusterer || !clustererEnabled || !map) return;
        clustererAddMarker?.(marker);
        return () => {
            clustererRemoveMarker?.(marker);
        }
    }, [marker, clusterer, clustererEnabled, clustererIsFinalized, clustererAddMarker, clustererRemoveMarker, map]);

    // bind all marker events
    useEffect(() => {
        if (!marker) return;

        const m = marker;

        if (onClick) marker.addListener('click', onClick);
        if (onDrag) marker.addListener('drag', onDrag);
        if (onDragStart) marker.addListener('dragstart', onDragStart);
        if (onDragEnd) marker.addListener('dragend', onDragEnd);

        if ((onDrag || onDragStart || onDragEnd) && !draggable) {
            console.warn(
                'You need to set the marker to draggable to listen to drag-events.'
            );
        }

        return () => {
            google.maps.event.clearInstanceListeners(m);
        };
    }, [marker, draggable, onClick, onDragStart, onDrag, onDragEnd]);

    // update other marker props when changed
    useEffect(() => {
        if (!marker) return;
        // console.log("Position:", position)
        if (position !== undefined) marker.position = position;
        if (draggable !== undefined) marker.gmpDraggable = draggable;
        if (collisionBehavior !== undefined)
            marker.collisionBehavior = collisionBehavior;
        if (zIndex !== undefined) marker.zIndex = zIndex;
        if (typeof title === 'string') marker.title = title;
    }, [marker, position, draggable, collisionBehavior, zIndex, title]);

    return [marker, contentContainer] as const;
}

export const AdvancedMarker = forwardRef(
    (props: AdvancedMarkerProps, ref: Ref<AdvancedMarkerRef>) => {
        const {children} = props;
        const [marker, contentContainer] = useAdvancedMarker(props);

        useImperativeHandle(ref, () => marker, [marker]);

        if (!marker) {
            return null;
        }

        return (
            <AdvancedMarkerContext.Provider value={{marker}}>
                {contentContainer !== null && createPortal(children, contentContainer)}
            </AdvancedMarkerContext.Provider>
        );
    }
);

AdvancedMarker.displayName = 'AdvancedMarker';

export function useAdvancedMarkerRef() {
    const [marker, setMarker] =
        useState<google.maps.marker.AdvancedMarkerElement | null>(null);

    const refCallback = useCallback((m: AdvancedMarkerRef | null) => {
        setMarker(m);
    }, []);

    return [refCallback, marker] as const;
}
