// import React, {PropsWithChildren, useContext, useEffect, useRef, useState} from 'react';
// import {createPortal} from 'react-dom';
// import {GoogleMapsContext} from "@vis.gl/react-google-maps";
// import {retry} from "next/dist/compiled/@next/font/dist/google/retry";
// import $ from 'jquery';
//

//
// export const InfoWindow = (props: PropsWithChildren<InfoWindowProps>) => {
//     const {children, anchor, onCloseClick, ...infoWindowOptions} = props;
//     const map = useContext(GoogleMapsContext)?.map;
//
//     const [contentContainer, setContentContainer] = useState<HTMLDivElement | null>(null);
//     const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
//
//
//     // Create new InfoWindow
//     useEffect(() => {
//         if (!map || !anchor) return;
//
//         const el = document.createElement('div');
//         // el.className = 'bg-white dark:bg-black';
//         // add classnamse to the info window
//         // if (infoWindowOptions.className) {
//         //     el.className = infoWindowOptions.className;
//         // }
//         setContentContainer(el);
//
//         const infoWindow = new google.maps.InfoWindow(infoWindowOptions);
//
//         infoWindow.setContent(el);
//         infoWindow.open({map, anchor});
//         infoWindowRef.current = infoWindow;
//
//         if (onCloseClick) {
//             infoWindow.addListener('closeclick', onCloseClick);
//         }
//
//         return () => {
//             if (infoWindowRef.current) {
//                 google.maps.event.clearInstanceListeners(infoWindowRef.current);
//                 infoWindowRef.current.close();
//                 infoWindowRef.current = null;
//             }
//             el.remove();
//             setContentContainer(null);
//         };
//     }, [map, anchor]);
//
//     // Update InfoWindow content when children change
//     useEffect(() => {
//         if (contentContainer && infoWindowRef.current) {
//             infoWindowRef.current.setContent(contentContainer);
//         }
//     }, [children, contentContainer]);
//
//     return (
//         <>{contentContainer && createPortal(children, contentContainer, props.myKey)}</>
//     );
// };


// InfoWindow.js

import React, {useContext, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {GoogleMapsContext} from "@vis.gl/react-google-maps";
import {useInfoWindowContext} from "@/app/map/_components/integrations/google-maps/info-window-provider";

export type InfoWindowProps = google.maps.InfoWindowOptions & {
    onCloseClick?: () => void;
    anchor?: google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null;
};
export const InfoWindow = ({children}: { children: React.ReactNode }) => {
    const map = useContext(GoogleMapsContext)?.map;
    const {infoWindowProps, openInfoWindow, closeInfoWindow} = useInfoWindowContext();
    const {onCloseClick, ...infoWindowOptions} = infoWindowProps || {};

    const contentContainer = useRef(document.createElement('div'));
    const infoWindowRef = useRef<google.maps.InfoWindow>();


    useEffect(() => {
        if (!map || !infoWindowProps) return;

        if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow(infoWindowOptions);
        }

        // add listener to close info window
        if (onCloseClick) infoWindowRef.current.addListener('closeclick', onCloseClick);


        const infoWindow = infoWindowRef.current;
        infoWindow.setContent(contentContainer.current);
        infoWindow.open({map, anchor: infoWindowProps.anchor});

        return () => infoWindow.close();
    }, [map, infoWindowProps, infoWindowOptions, closeInfoWindow]);


    if (!infoWindowProps) return null;

    return createPortal(children, contentContainer.current);
};

export const InfoWindow2 = ({children, anchor, onCloseClick, ...infoWindowOptions}: InfoWindowProps & {
    children: React.ReactNode
}) => {
    const map = useContext(GoogleMapsContext)?.map;
    // const {infoWindowProps, openInfoWindow, closeInfoWindow} = useInfoWindowContext();
    // const {onCloseClick, ...infoWindowOptions} = infoWindowProps || {};

    const contentContainer = useRef(document.createElement('div'));
    const infoWindowRef = useRef<google.maps.InfoWindow>();

    useEffect(() => {
        if (!map || !anchor) return;

        if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow(infoWindowOptions);
        }

        // add listener to close info window
        if (onCloseClick) infoWindowRef.current.addListener('closeclick', onCloseClick);


        const infoWindow = infoWindowRef.current;
        infoWindow.setContent(contentContainer.current);
        infoWindow.open({map, anchor});

        return () => infoWindow.close();
    }, [map, anchor, infoWindowOptions, onCloseClick]);

    if (!anchor) return null;

    return createPortal(children, contentContainer.current);
};
