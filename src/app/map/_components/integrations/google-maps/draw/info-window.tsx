import React, {useEffect, useRef} from 'react';
import {useMap} from '@vis.gl/react-google-maps';
import {createPortal} from 'react-dom';


export interface InfoWindowProps extends Omit<google.maps.InfoWindowOptions, 'content'> {
    children: React.ReactNode;
    anchor?: google.maps.MVCObject | null | google.maps.marker.AdvancedMarkerElement;
    onCloseClick?: () => void;
}


export interface InfoWindowProps {
    children: React.ReactNode;
    anchor?: google.maps.MVCObject | null | google.maps.marker.AdvancedMarkerElement;
    onCloseClick?: () => void;
    infoWindowRef?: React.RefObject<google.maps.InfoWindow>;
    contentContainerRef?: React.RefObject<HTMLDivElement>;
}

export const InfoWindow: React.FC<InfoWindowProps> = ({
                                                          children,
                                                          anchor,
                                                          onCloseClick,
                                                          infoWindowRef: externalInfoWindowRef,
                                                          contentContainerRef: externalContentContainerRef
                                                      }) => {
    const map = useMap();
    const internalInfoWindowRef = useRef<google.maps.InfoWindow>(new google.maps.InfoWindow());
    const internalContentContainerRef = useRef(document.createElement('div'));
    const infoWindowRef = externalInfoWindowRef || internalInfoWindowRef;
    const contentContainerRef = externalContentContainerRef || internalContentContainerRef;

    useEffect(() => {
        if (!infoWindowRef.current) return;
        if (anchor) {
            infoWindowRef.current.open(map, anchor);
        } else {
            infoWindowRef.current.close();
        }
    }, [anchor, infoWindowRef, map]);

    useEffect(() => {
        if (infoWindowRef.current) {
            infoWindowRef.current.setContent(contentContainerRef.current);
        }
    }, [children, infoWindowRef, contentContainerRef]);

    useEffect(() => {
        if (infoWindowRef.current && onCloseClick) {
            infoWindowRef.current.addListener('closeclick', onCloseClick);
            return () => {
                if (infoWindowRef.current)
                google.maps.event.clearListeners(infoWindowRef.current, 'closeclick');
            };
        }
    }, [onCloseClick, infoWindowRef]);

    return (contentContainerRef.current && createPortal(children, contentContainerRef.current));
};

export const useInfoWindowRef = () => {
    const infoWindowRef = useRef<google.maps.InfoWindow>(new google.maps.InfoWindow());
    const contentContainerRef = useRef(document.createElement('div'));
    return {infoWindowRef, contentContainerRef};
}


export const useInfoWindow = (props: InfoWindowProps) => {
    const map = useMap();
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const contentContainer = useRef(document.createElement('div'));

    useEffect(() => {
        if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow(props);
        } else {
            infoWindowRef.current.setOptions(props);
        }
    }, [props]);

    useEffect(() => {
        if (!infoWindowRef.current) return;
        infoWindowRef.current.setContent(contentContainer.current);
    }, [props.children]);

    useEffect(() => {
        if (!infoWindowRef.current || !props.anchor) return;
        infoWindowRef.current.open(map, props.anchor);
    }, [map, props.anchor]);

    useEffect(() => {
        if (!infoWindowRef.current || !props.onCloseClick) return;
        infoWindowRef.current.addListener('closeclick', props.onCloseClick);
        return () => {
            if (infoWindowRef.current) {
                google.maps.event.clearListeners(infoWindowRef.current, 'closeclick');
            }
        };
    }, [props.onCloseClick]);

    useEffect(() => {
        return () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        };
    }, []);

    return {infoWindowRef, contentContainer};
}


// export const InfoWindow: React.FC<InfoWindowProps> = ({children, anchor, onCloseClick, ...options}) => {




    // const map = useMap();
    // const contentContainer = useRef(document.createElement('div'));
    // const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    // useEffect(() => {
    //     if (!infoWindowRef.current) {
    //         infoWindowRef.current = new google.maps.InfoWindow(options);
    //     } else {
    //         infoWindowRef.current.setOptions(options);
    //     }
    // }, [options]);
    //
    // // Handle anchor change
    // useEffect(() => {
    //     if (!infoWindowRef.current) return;
    //     if (!anchor) {
    //         infoWindowRef.current.open(map);
    //     } else {
    //         infoWindowRef.current.open(map, anchor);
    //     }
    // }, [map, anchor]);
    //
    // // Handle content change
    // useEffect(() => {
    //     if (!infoWindowRef.current) return;
    //     infoWindowRef.current.setContent(contentContainer.current);
    // }, [children]);
    //
    // // Handle close click event
    // useEffect(() => {
    //     if (!infoWindowRef.current || !onCloseClick) return;
    //     infoWindowRef.current.addListener('closeclick', onCloseClick);
    //     return () => {
    //         if (infoWindowRef.current) {
    //             google.maps.event.clearListeners(infoWindowRef.current, 'closeclick');
    //         }
    //     };
    // }, [onCloseClick]);
    //
    // // Clean up
    // useEffect(() => {
    //     return () => {
    //         if (infoWindowRef.current) {
    //             infoWindowRef.current.close();
    //         }
    //     };
    // }, []);

//     return createPortal(children, contentContainer.current);
// };