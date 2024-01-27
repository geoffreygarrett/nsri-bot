"use client";

import {useDirectionsService} from '@vis.gl/react-google-maps';
import {useEffect, useState} from "react";
import {useMap} from "@vis.gl/react-google-maps";
import TravelMode = google.maps.TravelMode;
import {toast} from "sonner";


const Directions = ({
                        origin = "Paarl, South Africa",
                        destination = "Cape Town, South Africa",
                        travelMode = TravelMode.DRIVING,
                        options
                    }: {
    origin?: string | google.maps.LatLngLiteral | google.maps.Place,
    destination?: string | google.maps.LatLngLiteral | google.maps.Place,
    travelMode?: google.maps.TravelMode,
    options?: google.maps.DirectionsRequest
}) => {
    const {
        directionsService,
        directionsRenderer,
        renderRoute,
        setRenderedRouteIndex
    } = useDirectionsService({renderOnMap: true});
    const map = useMap();

    useEffect(() => {
        toast.info(`Requesting directions from ${origin} to ${destination}`);
        if (!directionsService) return;
        toast.info(`Directions service available`);
        if (!directionsRenderer) return;
        toast.info(`Directions renderer available`);
        if (!origin) return;
        if (!destination) return;
        directionsService.route({
            origin,
            destination,
            travelMode,
            ...options
        }, (response, status) => {
            if (status === 'OK') {
                toast.success(`Directions request successful`);
                directionsRenderer.setMap(map);
                directionsRenderer.setDirections(response);
                renderRoute ? (response) : null;
                if (setRenderedRouteIndex) {
                    setRenderedRouteIndex(0);
                }
            } else {
                console.error(`Directions request failed due to ${status}`);
                toast.error(`Directions request failed due to ${status}`);

            }
        });

    }, [origin, destination, travelMode, options, directionsService, directionsRenderer, renderRoute, setRenderedRouteIndex, map]);


    return <></>


}

export default Directions;

