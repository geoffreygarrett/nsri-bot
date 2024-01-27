import React, {
    forwardRef,
    Ref,
    useCallback,
    useEffect,
    useState,
    createContext,
    useImperativeHandle
} from "react";
import {useMap} from "@vis.gl/react-google-maps";

interface CallbackEvents {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
}

export interface PolylineProps {
    path?: google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[] | google.maps.LatLngLiteral[];
    editable?: boolean;
    draggable?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
    opts?: Omit<
        google.maps.PolylineOptions,
        "map" | "path" | "editable" | "draggable" | "strokeColor" | "strokeOpacity" | "strokeWeight" | "visible" | "zIndex"
    >;
} // & CallbackEvents;

const usePolyline = ({
                         path,
                         editable,
                         draggable,
                         strokeColor,
                         strokeOpacity,
                         strokeWeight,
                         visible,
                         zIndex,
                         onClick,
                         opts,
                     }: PolylineProps & CallbackEvents) => {
    const map = useMap();
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (polyline) {
            polyline.setOptions({...opts});
        } else {
            setPolyline(new google.maps.Polyline(opts));
        }
    }, [opts, polyline]);

    useEffect(() => {
        if (!polyline || !onClick) return;
        polyline.addListener('click', onClick);
        return () => {
            google.maps.event.clearListeners(polyline, 'click');
        };
    }, [polyline, onClick]);

    useEffect(() => {
        if (!map || !polyline) return;
        polyline.setMap(map);
        return () => {
            polyline.setMap(null);
        }
    }, [map, polyline]);

    useEffect(() => {
        if (!polyline || !path) return;
        polyline.setPath(path);
    }, [path, polyline]);

    useEffect(() => {
        if (!polyline || editable === undefined) return;
        polyline.setEditable(editable);
    }, [editable, polyline]);

    useEffect(() => {
        if (!polyline || draggable === undefined) return;
        polyline.setDraggable(draggable);
    }, [draggable, polyline]);

    // Additional effect hooks for other properties
    useEffect(() => {
        if (polyline && strokeColor !== undefined) {
            polyline.setOptions({strokeColor});
        }
    }, [strokeColor, polyline]);

    useEffect(() => {
        if (polyline && strokeOpacity !== undefined) {
            polyline.setOptions({strokeOpacity});
        }
    }, [strokeOpacity, polyline]);

    useEffect(() => {
        if (polyline && strokeWeight !== undefined) {
            polyline.setOptions({strokeWeight});
        }
    }, [strokeWeight, polyline]);

    useEffect(() => {
        if (polyline && visible !== undefined) {
            polyline.setVisible(visible);
        }
    }, [visible, polyline]);

    useEffect(() => {
        if (polyline && zIndex !== undefined) {
            polyline.setOptions({zIndex});
        }
    }, [zIndex, polyline]);

    return polyline;
};

const PolylineContext = createContext<{ polyline: google.maps.Polyline | null }>({polyline: null});

export const Polyline = forwardRef<google.maps.Polyline | null, PolylineProps & {
    children?: React.ReactNode
} & CallbackEvents>(
    ({
         path,
         editable,
         draggable,
         strokeColor,
         strokeOpacity,
         strokeWeight,
         visible,
         zIndex,
         children,
         opts,
         onClick
     }, ref: Ref<google.maps.Polyline | null>) => {
        const polyline = usePolyline({
            path,
            editable,
            draggable,
            strokeColor,
            strokeOpacity,
            strokeWeight,
            visible,
            zIndex,
            opts,
            onClick
        });

        useImperativeHandle(ref, () => polyline, [polyline]);

        if (!polyline) {
            return null;
        }

        return <PolylineContext.Provider value={{polyline}}>{children}</PolylineContext.Provider>;
    }
);

Polyline.displayName = 'Polyline';

export function usePolylineRef() {
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
    const refCallback = useCallback((p: google.maps.Polyline | null) => {
        setPolyline(p);
    }, []);
    return [refCallback, polyline] as const;
}
