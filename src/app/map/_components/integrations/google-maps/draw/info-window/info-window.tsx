import React, {useContext, useEffect, useRef} from 'react';
import {useMap} from '@vis.gl/react-google-maps';
import { useInfoWindowStateContext, useInfoWindowControlContext} from './info-window-context';
import {createPortal} from 'react-dom';

export const InfoWindow: React.FC<{ options?: google.maps.InfoWindowOptions }> = ({options}) => {

    const {infoWindowRef, content, anchor} = useInfoWindowStateContext();
    const {closeInfoWindow} = useInfoWindowControlContext();
    const map = useMap();
    const contentContainer = useRef(document.createElement('div'));

    // Update InfoWindow options
    useEffect(() => {
        if (infoWindowRef.current) {
            infoWindowRef.current.setOptions(options); // Add necessary options here
        }
    }, [infoWindowRef, options]);

    // Set content of the InfoWindow
    useEffect(() => {
        if (infoWindowRef.current) {
            infoWindowRef.current.setContent(contentContainer.current);
        }
    }, [infoWindowRef, content]);

    // Open InfoWindow with the specified anchor
    useEffect(() => {
        if (infoWindowRef.current && anchor) {
            infoWindowRef.current.open(map, anchor);
        } else {
            infoWindowRef.current?.close();
        }
    }, [infoWindowRef, anchor, map]);

    // Add listener for 'closeclick' event
    useEffect(() => {
        if (infoWindowRef.current) {
            infoWindowRef.current.addListener('closeclick', closeInfoWindow);
            return () => {
                if (infoWindowRef.current)
                google.maps.event.clearListeners(infoWindowRef.current, 'closeclick');
            };
        }
    }, [infoWindowRef]);

    // Clean up by closing the InfoWindow when the component is unmounted
    useEffect(() => {
        return () => {
            infoWindowRef.current?.close();
        };
    }, [infoWindowRef]);

    return content ? createPortal(content, contentContainer.current) : null;
};
