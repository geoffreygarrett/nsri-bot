"use client";

// import Size = google.maps.Size;

import {EquipmentStatus, IExport, IMarker, DataType} from "@/components/types";
import {test_region} from "@/components/test_region";

// const data = {
//     "type": "FeatureCollection",
//     "features": [
//         {
//             "id": "KMD-0027",
//             "name": "Kleinmond Lagoon Bridge",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0373592, -34.3408457]
//         },
//         {
//             "id": "KMD-0025",
//             "name": "Kleinmond Main Beach",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0376486, -34.3412517]
//         },
//         {
//             "id": "KMD-0004",
//             "name": "Preekboom",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0364928, -34.3412722]
//         },
//         {
//             "id": "KMD-0003",
//             "name": "Main Beach Lifesavers Station",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0368042, -34.3423213]
//         },
//         {
//             "id": "KMD-0048",
//             "name": "Lagoon Mouth Parking",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0369674, -34.3428559]
//         },
//         {
//             "id": "KMD-0006",
//             "name": "Drievis Tidal Pool",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.034004517566, -34.3443622592103]
//         },
//         // For buoys with unclear or missing numbers, assigning new sequential IDs starting from 51
//         {
//             "id": "KMD-0051",
//             "name": "Gustav Adolf Shipwreck Graves",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0014012, -34.3437285]
//         },
//         {
//             "id": "KMD-0052",
//             "name": "Palmiet Day Camp",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [18.9948902, -34.3409659]
//         },
//         {
//             "id": "KMD-0053",
//             "name": "Island Palmiet Lagoon",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [18.995224825279301, -34.342389896223501]
//         },
//         {
//             "id": "KMD-0054",
//             "name": "Old Boat Club Slipway Picnic Spot",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [18.9915057, -34.3381631]
//         },
//         {
//             "id": "KMD-0055",
//             "name": "Proposed New Buoy",
//             "status": "PROPOSED",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0405717981542, -34.340878265100898]
//         },
//         {
//             "id": "KMD-0056",
//             "name": "Proposed New Buoy",
//             "status": "PROPOSED",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [18.966248617419701, -34.360941955247199]
//         },
//         {
//             "id": "KMD-0057",
//             "name": "Proposed New Buoy",
//             "status": "PROPOSED",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [18.990537355798999, -34.330284565111597]
//         },
//         // Keeping original IDs for buoys with different station numbers
//         {
//             "id": "17-23",
//             "name": "Parking Area (Near Malherbe Stoel)",
//             "status": "OK",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.0317733, -34.3444143]
//         },
//         {
//             "id": "17-25",
//             "name": "Missing Buoy",
//             "status": "MISSING",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [18.891111, -34.373333]
//         },
//         {
//             "id": "KMD-0058",
//             "name": "Fisherhaven Public Slipway",
//             "status": "REPLACE",
//             "lastChecked": "2023-04-01T12:00:00Z",
//             "coordinates": [19.124283, -34.3554749]
//         }
//     ]
// };

// impor data from json file
import data from "@/placemarks.json";

const imarkers: IMarker[] = data.map((feature, index) => ({
    id: feature.id,
    name: feature.name,
    lat: Number(feature.lat),
    lng: Number(feature.lng),
    alt: Number(feature.alt),
    last_checked: "2023-04-01T12:00:00Z",
    address: feature.formatted_address,
    status: feature.status,
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
import {DARK_STYLES, LIGHT_STYLES} from "@/components/map_styles";


import Image from 'next/image';
import export_kml from "@/components/export_kml";
import PopoverMenu from "@/components/popover_menu";

import ItemInfoWindowContent from "@/components/map_info_window";

// import Image from 'next/image';
// import { useState } from 'react';
// import { MapPinIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
// import { EquipmentStatus, DataType } from '../path/to/constants'; // Adjust the import path


const FloatingUIBar = ({position, onExportClick}: { position: string, onExportClick: () => void }) => {
    const positionClasses = {
        'top-left': 'top-0 left-0',
        'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
        'top-right': 'top-0 right-0',
        // Add more positioning options as needed
    };

    const selectedPosition = positionClasses[position] || 'top-0 left-0';

    return (
        <div className={`absolute ${selectedPosition} m-4`}>
            <button
                onClick={onExportClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Export to KML
            </button>
        </div>
    );
};


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
    const defaultZoom = 11;
    const [mapTypeId, setMapTypeId] = useState(DEFAULT_MAP_ID);
    const [activeItem, setActiveItem] = useState<IMarker | null>(null);
    // const [zoom, setZoom] = useState(defaultZoom);
    const [map, setMap] = useState<google.maps.Map | null>(null);

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


    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
                zoom={defaultZoom}
                mapTypeId={mapTypeId}
                center={defaultCenter}
                disableDefaultUI={true}
                mapId={'4hde5345723cdegs'}
                // mapId={mapTypeId}
                // styles={DARK_STYLES}
                gestureHandling="greedy"
                fullscreenControl={true}
                fullscreenControlOptions={{position: ControlPosition.TOP_RIGHT}}
                streetViewControl={true}
                zoomControl={true}
                // onZoomChanged={ev => setZoom(ev.detail.zoom)}
                style={{height: '100vh', width: '100%', position: 'relative'}}>
                <Markers points={imarkers} handleMarkerClick={handleItemClick}/>
                <Polyline/>
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
