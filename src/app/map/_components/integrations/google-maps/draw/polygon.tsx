"use client";

import {useMap} from "@vis.gl/react-google-maps";
import React, {forwardRef, type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";

interface CallbackEvents {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onContextMenu?: (e: google.maps.MapMouseEvent) => void;
    onDblClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onMouseDown?: (e: google.maps.MapMouseEvent) => void;
    onMouseMove?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseUp?: (e: google.maps.MapMouseEvent) => void;
}

interface PathCallbackEvents {
    onSetAt?: (index: number, obj: any) => void;
    onInsertAt?: (index: number, obj: any) => void;
}

const eventNameMapping: { [key: string]: string } = {
    onClick: 'click',
    onContextMenu: 'contextmenu',
    onDblClick: 'dblclick',
    onDrag: 'drag',
    onDragEnd: 'dragend',
    onDragStart: 'dragstart',
    onMouseDown: 'mousedown',
    onMouseMove: 'mousemove',
    onMouseOut: 'mouseout',
    onMouseOver: 'mouseover',
    onMouseUp: 'mouseup',
};


export interface PolygonProps {
    paths?: google.maps.MVCArray<any> | any[];
    editable?: boolean;
    draggable?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
    opts?: Omit<
        google.maps.PolygonOptions,
        "map"
        | "paths"
        | "editable"
        | "draggable"
        | "fillColor"
        | "fillOpacity"
        | "strokeColor"
        | "strokeOpacity"
        | "strokeWeight"
        | "visible"
        | "zIndex">;
}


const usePolygon = ({
                        paths,
                        editable,
                        draggable,
                        fillColor,
                        fillOpacity,
                        strokeColor,
                        strokeOpacity,
                        strokeWeight,
                        visible,
                        zIndex,
                        opts,
                        onSetAt,
                        onInsertAt,
                        ...eventCallbacks
                    }: PolygonProps & CallbackEvents & PathCallbackEvents) => {

    const map = useMap();
    const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (polygon) {
            polygon.setOptions({...opts})
        } else {
            setPolygon(new google.maps.Polygon(opts));
        }
    }, [opts, polygon]);


    useEffect(() => {
        if (!polygon || !eventCallbacks) return;


        // Attach event listeners
        Object.entries(eventCallbacks).forEach(([event, handler]) => {
            if (handler) {
                polygon.addListener(eventNameMapping[event], handler);
            }
        });

        return () => {
            // Detach event listeners
            Object.entries(eventCallbacks).forEach(([event, handler]) => {
                google.maps.event.clearListeners(polygon, eventNameMapping[event]);
            });
        };

    }, [polygon, eventCallbacks]);

    useEffect(() => {
        if (!map || !polygon) return;
        polygon.setMap(map);
        return () => {
            polygon.setMap(null);
        }
    }, [map, polygon]);

    useEffect(() => {
        if (!polygon || !paths) return;
        polygon.setPaths(paths);
        if (onInsertAt) google.maps.event.addListener(polygon.getPath(), 'insert_at', onInsertAt);
        if (onSetAt) google.maps.event.addListener(polygon.getPath(), 'set_at', onSetAt);
        return () => {
            if (onInsertAt) google.maps.event.clearListeners(polygon.getPath(), 'insert_at');
            if (onSetAt) google.maps.event.clearListeners(polygon.getPath(), 'set_at');
        }
    }, [paths, polygon, onSetAt, onInsertAt]);

    useEffect(() => {
        if (!polygon || editable === undefined) return;
        polygon.setEditable(editable);
    }, [editable, polygon]);

    useEffect(() => {
        if (!polygon || draggable === undefined) return;
        polygon.setDraggable(draggable);
    }, [draggable, polygon]);

    // Additional effect hooks for other properties
    useEffect(() => {
        if (polygon && fillColor !== undefined) {
            polygon.setOptions({fillColor});
        }
    }, [fillColor, polygon]);

    useEffect(() => {
        if (polygon && fillOpacity !== undefined) {
            polygon.setOptions({fillOpacity});
        }
    }, [fillOpacity, polygon]);

    useEffect(() => {
        if (polygon && strokeColor !== undefined) {
            polygon.setOptions({strokeColor});
        }
    }, [strokeColor, polygon]);

    useEffect(() => {
        if (polygon && strokeOpacity !== undefined) {
            polygon.setOptions({strokeOpacity});
        }
    }, [strokeOpacity, polygon]);

    useEffect(() => {
        if (polygon && strokeWeight !== undefined) {
            polygon.setOptions({strokeWeight});
        }
    }, [strokeWeight, polygon]);

    useEffect(() => {
        if (polygon && visible !== undefined) {
            polygon.setVisible(visible);
        }
    }, [visible, polygon]);

    useEffect(() => {
        if (polygon && zIndex !== undefined) {
            polygon.setOptions({zIndex});
        }
    }, [zIndex, polygon]);

    return polygon;
}

const PolygonContext = React.createContext<{ polygon: google.maps.Polygon | null }>({polygon: null});

export type PolygonPropsAll = PolygonProps & CallbackEvents & PathCallbackEvents;

export const Polygon = forwardRef<google.maps.Polygon | null, PolygonProps & {
    children?: React.ReactNode
} & CallbackEvents & PathCallbackEvents

>(({
       paths,
       editable,
       draggable,
       fillColor,
       fillOpacity,
       strokeColor,
       strokeOpacity,
       strokeWeight,
       visible,
       zIndex,
       children,
       opts,
       onInsertAt,
       onSetAt,
       ...eventCallbacks

   }
    , ref: Ref<google.maps.Polygon | null>) => {

    const polygon = usePolygon({
        paths,
        editable,
        draggable,
        fillColor,
        fillOpacity,
        strokeColor,
        strokeOpacity,
        strokeWeight,
        visible,
        zIndex,
        opts,
        onInsertAt,

        onSetAt,
        ...eventCallbacks

    });

    // Expose internal ref to parent components
    useImperativeHandle(ref, () => polygon, [polygon]);

    if (!polygon) {
        return null;
    }

    return (
        <PolygonContext.Provider value={{polygon}}>
            {children}
        </PolygonContext.Provider>)

});

Polygon.displayName = 'Polygon';


export function usePolygonRef() {
    const [polygon, setPolygon] =
        useState<google.maps.Polygon | null>(null);

    const refCallback = useCallback((m: google.maps.Polygon | null) => {
        setPolygon(m);
    }, []);

    return [refCallback, polygon] as const;
}



