"use client";

import {EquipmentStatus, IExport, IMarker, DataType} from "@/components/types";
import {test_region} from "@/components/test_region";
import data from "@/placemarks.json";

const imarkers: IMarker[] = data.map((feature, index) => ({
    id: feature.id,
    name: feature.name,
    lat: Number(feature.lat),
    lng: Number(feature.lng),
    alt: Number(feature.alt),
    last_checked: "2021-08-01 12:00:00",
    address: feature.formatted_address,
    status: feature.status as EquipmentStatus,
    type: DataType.MARKER,
    // image_src: "/test.jpeg"
}));


import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    AdvancedMarker,
    APIProvider,
    InfoWindow,
    Map,
    ControlPosition,
    Pin,
    useMap,
    MapControl,
    useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import {Marker, MarkerClusterer} from '@googlemaps/markerclusterer';


const MapTypeId = {
    HYBRID: 'hybrid',
    ROADMAP: 'roadmap',
    SATELLITE: 'satellite',
    TERRAIN: 'terrain'
};

const DEFAULT_MAP_ID = MapTypeId.SATELLITE;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

import Image from 'next/image';
import export_kml from "@/components/export_kml";
import ItemInfoWindowContent from "@/components/map_info_window";

// import Image from 'next/image';
// import { useState } from 'react';
// import { MapPinIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
// import { EquipmentStatus, DataType } from '../path/to/constants'; // Adjust the import path


const export_items = [
    ["Google Earth (.kml)", export_kml],
];


const MemoInfoWindow = React.memo(InfoWindow);


const Polyline = () => {
    const map = useMap();
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
    const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map) return;
        const parsed_region = test_region.coordinates[0][0].map(([lng, lat]) => ({lat, lng}));
        const region_polygon = new google.maps.Polygon({
            paths: parsed_region,
            strokeColor: "#cedcfc",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#406fd2",
            fillOpacity: 0.2,
            map: map
        });
        // place name in the midle of the polygon
        const region_polygon_bounds = new google.maps.LatLngBounds();
        region_polygon.getPath().forEach(function (element) {
            region_polygon_bounds.extend(element);
        });
        const region_polygon_center = region_polygon_bounds.getCenter();
        // const region_polygon_label = google.maps.drawing.OverlayType.POLYGON;
        // const region_polygon_label = new google.maps.Marker({
        //     position: region_polygon_center,
        //     map: map,
        //     // label: "Kleinmond",
        //     // label color
        //     // icon: {
        //     //     path: google.maps.SymbolPath.CIRCLE,
        //     //     // scale: 1,
        //     //     strokeColor: "#406fd2",
        //     //     strokeWeight: 1,
        //     //     fillColor: "#406fd2",
        //     //     fillOpacity: 0.8,
        //     // }
        // });
        setPolygon(region_polygon);
    }, [map]);

    return <></>
}

import {SendMessageType} from "@/server/types";
// Main map component
const SimpleMap = ({sendMessage}: { sendMessage: SendMessageType }) => {
    const defaultCenter = {lat: -34.3412517, lng: 19.0376486};
    const defaultZoom = 15;
    const [mapTypeId, setMapTypeId] = useState(DEFAULT_MAP_ID);
    const [activeItem, setActiveItem] = useState<IMarker | null>(null);
    // const [zoom, setZoom] = useState(defaultZoom);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);


    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                position => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log("Location access denied.");
                },
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);


    const exportToKml = () => {
        // Call the function to create and download the KML file
        export_kml(imarkers as IExport[]); // replace exportKmlFunction with the actual function name
    };

    const handleItemClick = useCallback((item: IMarker) => {
        if (!item) return;
        if (activeItem?.id === item.id) {
            setActiveItem(null);
            return;
        }
        setActiveItem(item);
    }, [activeItem]);

    const handleInfoWindowClose = useCallback(() => {
        setActiveItem(null);
    }, []);

    const center = userLocation || defaultCenter;


    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>

            <Map
                zoom={defaultZoom}
                mapTypeId={mapTypeId}
                center={center}
                disableDefaultUI={true}
                mapId={'4hde5345723cdegs'}
                gestureHandling="greedy"
                fullscreenControl={true}
                fullscreenControlOptions={{position: ControlPosition.TOP_RIGHT}}
                streetViewControl={true}
                zoomControl={true}
                // onZoomChanged={ev => setZoom(ev.detail.zoom)}
                style={{height: '100vh', width: '100%', position: 'relative'}}>
                <Markers points={imarkers} handleMarkerClick={handleItemClick}/>
                <Polyline/>
                {userLocation && (
                    <AdvancedMarker position={userLocation}>
                        <Pin background={'rgb(255,0,0)'}
                             borderColor={'#560101'}
                             scale={1.1}>
                            <div className="flex items-center justify-center">
                                <div className="text-white text-xs font-semibold">You</div>
                            </div>
                        </Pin>
                    </AdvancedMarker>
                )}
                {activeItem && (
                    <MemoInfoWindow
                        minWidth={200}
                        position={{lat: activeItem.lat, lng: activeItem.lng}}
                        maxWidth={400}
                        pixelOffset={{width: 0, height: -40} as google.maps.Size}
                        onCloseClick={handleInfoWindowClose}>
                        <ItemInfoWindowContent activeItem={activeItem} sendMessage={sendMessage}/>
                    </MemoInfoWindow>
                )}

            </Map>
        </APIProvider>
    );
};

// Type definitions for clarity
type Props = { points: IMarker[], handleMarkerClick: (feature: any) => void };


const Markers = ({points, handleMarkerClick}: Props) => {
    return (
        <>
            {points.map(point => (
                <AdvancedMarker
                    position={point}
                    key={point.id}
                    onClick={() => handleMarkerClick(point)}
                >
                    <Pin background={'rgb(255,126,192)'}
                         borderColor={'#9d2d65'}
                         scale={1.1}>
                        <div className="flex items-center justify-center">
                            <div className="text-white text-xs font-semibold">{point.id.slice(-2)}</div>
                        </div>
                    </Pin>
                </AdvancedMarker>
            ))}
        </>
    );
};


export default SimpleMap;
