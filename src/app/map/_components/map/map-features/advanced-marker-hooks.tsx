import React, {useCallback, useEffect, useMemo} from "react";
import {PencilSquareIcon} from "@heroicons/react/24/solid";
import {cn} from "@/lib/utils";
import {Tables} from "@/types/supabase";
import {
    AdvancedMarker,
    useAdvancedMarkerRef
} from "@/app/map/_components/integrations/google-maps/draw/advanced-marker";
import Pin from "@/app/map/_components/integrations/google-maps/draw/pin";
import {isRescueBuoy} from "@/app/map/map";
import {useTheme} from "next-themes";
import {latToZIndex} from "@/app/map/util";
import {
    useInfoWindowControlContext
} from "@/app/map/_components/integrations/google-maps/draw/info-window/info-window-context";

export const UnsynchronizedChangesIcon: React.FC<{ className?: string }> = ({className}) => {
    return <PencilSquareIcon ///ExclamationCircleIcon
        className={cn('h-6 w-6 top-0 right-0 -mt-2 -mr-2 absolute text-red-600 dark:text-red-400 animate-pulse bg-white rounded bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70', className)}/>
}


export type CallbackType = (e: google.maps.MapMouseEvent, marker: google.maps.marker.AdvancedMarkerElement, item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => void;

export interface AdvancedMarkerProps<K> {
    item: K;
    data?: Record<string, any>;
    onClick?: CallbackType;
    onDragEnd?: CallbackType;
    draggable?: boolean;
    synchronized?: boolean;
    openInfoWindow?: (content: React.ReactNode, marker: google.maps.marker.AdvancedMarkerElement, id: string | number) => void;
    toggleInfoWindow?: (content: React.ReactNode, marker: google.maps.marker.AdvancedMarkerElement, id: string | number) => void;
    infoWindowRef?: React.MutableRefObject<google.maps.InfoWindow | null>;
    components?: {
        InfoWindowContent?: React.ComponentType<{
            item: K,
            marker: google.maps.marker.AdvancedMarkerElement,
            data?: Record<string, any>
        }>;
        PinContent?: React.ComponentType<{
            item: K,
            data?: Record<string, any>
        }>;
    };
}


const useColorFunction = () => {
    const {resolvedTheme} = useTheme();

    return useCallback((item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
        const adjustColor = (hex: string, factor: number) => {
            let color = parseInt(hex.slice(1), 16),
                r = (color >> 16) * factor,
                g = ((color >> 8) & 0x00FF) * factor,
                b = (color & 0x0000FF) * factor;

            r = Math.min(Math.floor(r), 255);
            g = Math.min(Math.floor(g), 255);
            b = Math.min(Math.floor(b), 255);

            return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
        };

        if (isRescueBuoy(item)) {
            switch (item.status) {
                case "OK":
                    return {
                        background: resolvedTheme === 'dark' ? adjustColor('#fd78f4', 0.7) : '#fd78f4',
                        border: resolvedTheme === 'dark' ? adjustColor('#FF10F0', 0.7) : '#FF10F0'
                    };
                case "MISSING":
                    return {
                        background: resolvedTheme === 'dark' ? adjustColor('#F44336', 0.7) : '#F44336',
                        border: resolvedTheme === 'dark' ? adjustColor('#F44336', 0.7) : '#F44336'
                    };
                case "ATTENTION":
                    return {
                        background: resolvedTheme === 'dark' ? adjustColor('#FFEB3B', 0.5) : '#FFEB3B',
                        border: resolvedTheme === 'dark' ? adjustColor('#FFEB3B', 0.7) : '#FFEB3B'
                    };
                case "PROPOSED":
                    return {
                        background: resolvedTheme === 'dark' ? adjustColor('#00BCD4', 0.7) : '#00BCD4',
                        border: resolvedTheme === 'dark' ? adjustColor('#00BCD4', 0.7) : '#00BCD4'
                    };
                default:
                    return {
                        background: resolvedTheme === 'dark' ? '#767676' : '#bcbcbc',
                        border: resolvedTheme === 'dark' ? '#979595' : '#d4d4d4'
                    };
            }
        } else {
            return {
                background: resolvedTheme === 'dark' ? '#767676' : '#ffffff',
                border: resolvedTheme === 'dark' ? '#979595' : '#252971'
            };
        }
    }, [resolvedTheme]);
};

export const _AdvancedMarkerWithHooks = <K extends Tables<'rescue_buoys'> | Tables<'nsri_stations'>>({
                                                                                                         item,
                                                                                                         data,
                                                                                                         onClick,
                                                                                                         onDragEnd,
                                                                                                         draggable,

                                                                                                         components
                                                                                                     }: AdvancedMarkerProps<K>) => {

    const [markerRef, marker] = useAdvancedMarkerRef();
    const colorFunction = useColorFunction();
    const {toggleInfoWindow, closeInfoWindow, openInfoWindow, setContent, setAnchor} = useInfoWindowControlContext();
    const {InfoWindowContent, PinContent} = components || {};
    const [open, setOpen] = React.useState(false);
    const memoizedData = useMemo(() => ({
        ...data,
        draggable,
    }), [data, draggable]);

    const handleClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!marker) return;
        if (onClick) onClick(e, marker, item);
        if (typeof InfoWindowContent === "function") {
            if (toggleInfoWindow) {
                setOpen(!open);
                toggleInfoWindow(<InfoWindowContent
                    item={item as K}
                    data={memoizedData}
                    marker={marker}/>, marker, item.id);
            }
        }
    }, [marker, onClick, item, InfoWindowContent, toggleInfoWindow, open, memoizedData]);

    // if window is open on this one update window content
    useEffect(() => {
        if (!marker) return;
        if (typeof InfoWindowContent === "function") {
            if (setContent) {
                setContent(<InfoWindowContent item={item as K} data={memoizedData} marker={marker}/>);
            }
        }
    }, [marker, InfoWindowContent, openInfoWindow, item, memoizedData, open, setContent]);

    return (
        <AdvancedMarker
            ref={markerRef}
            draggable={draggable}
            position={{lat: item.location.coordinates[1], lng: item.location.coordinates[0]}}
            onDragEnd={marker && onDragEnd && draggable ? (e: google.maps.MapMouseEvent) => onDragEnd(e, marker, item) : undefined}
            onClick={handleClick}
            zIndex={latToZIndex(item.location.coordinates[1])}>
            <Pin borderColor={colorFunction(item).border}
                 background={colorFunction(item).background}>
                {PinContent && <PinContent item={item} data={memoizedData}/>}
            </Pin>
        </AdvancedMarker>
    )
};

const withMemo = <K extends Tables<'rescue_buoys'> | Tables<'nsri_stations'>>(Component: React.ComponentType<AdvancedMarkerProps<K>>) => {
    return React.memo(Component, (prevProps, nextProps) => {
        return (prevProps.item.id === nextProps.item.id
            && prevProps.item.updated_at === nextProps.item.updated_at
            && prevProps.data?.synchronized === nextProps.data?.synchronized
            && prevProps.draggable === nextProps.draggable
            && prevProps?.data?.selected === nextProps?.data?.selected
        );
    });
};

export const AdvancedMarkerWithHooksRescueBuoys = withMemo(_AdvancedMarkerWithHooks<Tables<'rescue_buoys'>>);
export const AdvancedMarkerWithHooksNsriStations = withMemo(_AdvancedMarkerWithHooks<Tables<'nsri_stations'>>);
