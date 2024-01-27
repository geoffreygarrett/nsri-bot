import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Marker, useMap, useMapsLibrary} from '@vis.gl/react-google-maps';
// import {latToZIndex} from '@/app/map/map';
import LatLng = google.maps.LatLng;
import {AdvancedMarker} from "@/app/map/_components/integrations/google-maps/draw/advanced-marker";
import Pin from "@/app/map/_components/integrations/google-maps/draw/pin";
// import {InfoWindow, InfoWindow2} from "@/components/map-features/info-window";
import {InfoWindow} from "@/app/map/_components/integrations/google-maps/draw/info-window";

interface LineOfPositionProps {
    from: google.maps.LatLngLiteral;
    assumedError: number;
    map?: google.maps.Map;
    heading: number;
    distance: number;
    setPositionLine: React.Dispatch<LineOfPosition>;
    children?: React.ReactNode;
}

interface LineOfPosition {
    id: string | number;
    assumedError: number;
    centerLine: google.maps.LatLng[];
    starboardLine: google.maps.LatLng[];
    portLine: google.maps.LatLng[];
    open: boolean;
    draggable: boolean;
}


// interface IntersectionResult {
//     doIntersect: boolean;
//     intersection?: [number, number];
// }
//
// function findIntersection(line1: LineOfPosition, line2: LineOfPosition): IntersectionResult {
//     const degToRad = (deg: number): number => deg * (Math.PI / 180);
//     const radToDeg = (rad: number): number => rad * (180 / Math.PI);
//
//     // Convert headings and positions to radians
//     const heading1Rad = degToRad(line1.heading);
//     const heading2Rad = degToRad(line2.heading);
//     const lat1Rad = degToRad(line1.point.latitude);
//     const lon1Rad = degToRad(line1.point.longitude);
//     const lat2Rad = degToRad(line2.point.latitude);
//     const lon2Rad = degToRad(line2.point.longitude);
//
//     // Calculations based on spherical trigonometry
//     const deltaLon = lon2Rad - lon1Rad;
//     const x = Math.cos(lat2Rad) * Math.sin(deltaLon);
//     const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);
//     const initialBearingRad = Math.atan2(x, y);
//     const finalBearingRad = Math.atan2(-x, -y) + Math.PI;
//
//     if (Math.sin(heading1Rad - initialBearingRad) * Math.sin(heading1Rad - finalBearingRad) < 0 &&
//         Math.sin(heading2Rad - initialBearingRad) * Math.sin(heading2Rad - finalBearingRad) < 0) {
//         const intersectionLat = Math.atan2(Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(heading1Rad) * Math.sin(deltaLon) + Math.sin(lat2Rad) * Math.cos(lat1Rad) * Math.cos(heading2Rad),
//             Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(heading1Rad - heading2Rad));
//         const intersectionLon = lon1Rad + Math.atan2(Math.sin(heading1Rad) * Math.sin(deltaLon) * Math.cos(lat1Rad),
//             Math.cos(deltaLon) - Math.sin(lat1Rad) * Math.sin(intersectionLat));
//
//         return {
//             doIntersect: true,
//             intersectionPoint: {
//                 latitude: radToDeg(intersectionLat),
//                 longitude: radToDeg(intersectionLon)
//             }
//         };
//     }
//
//     return {doIntersect: false};
// }


const LineOfPosition: React.FC<LineOfPositionProps> = ({
                                                           map: mapArg,
                                                           from,
                                                           children,
                                                           heading,
                                                           distance,
                                                           assumedError,
                                                           setPositionLine
                                                       }) => {
    const map = useMap() || mapArg;
    const geometryLib = useMapsLibrary('geometry');
    const markerRef = useRef<google.maps.Marker | null>(null);
    const polyRef = useRef<google.maps.Polyline | null>(null);
    const polySRef = useRef<google.maps.Polyline | null>(null);
    const polyPRef = useRef<google.maps.Polyline | null>(null);
    const geodesicPolyRef = useRef<google.maps.Polyline | null>(null);
    const [position, setPosition] = useState<google.maps.LatLngLiteral>(from);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!geometryLib || !map) return;
        console.log("LineOfPosition: useEffect");

        const lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 1
        };

        // Initialize marker
        markerRef.current = new google.maps.Marker({
            map,
            draggable: true,
            position: from,
            // zIndex: latToZIndex(from.lat),
        });


        // Initialize polylines
        polyRef.current = new google.maps.Polyline({strokeColor: "#000000", strokeOpacity: 1.0, strokeWeight: 1, map});
        polySRef.current = createPolyline(lineSymbol);
        polyPRef.current = createPolyline(lineSymbol);

        // Create polyline with options
        function createPolyline(lineSymbol: google.maps.Symbol) {
            return new google.maps.Polyline({
                strokeColor: "#000000",
                strokeOpacity: 0,
                strokeWeight: 1,
                icons: [{icon: lineSymbol, offset: '0', repeat: '10px'}],
                map,
            });
        }

    }, [map, geometryLib]);

    const updatePosition = useCallback(() => {
        if (!geometryLib || !markerRef.current || !polyRef.current || !polyPRef.current || !polySRef.current!) return;

        const position1 = markerRef.current.getPosition();
        if (!position1) return;

        const position2 = geometryLib.spherical.computeOffset(position1, distance, heading);
        updatePolyline(polyRef.current, [position1, position2]);

        const positionP = geometryLib.spherical.computeOffset(position1, distance, heading + assumedError);
        const positionS = geometryLib.spherical.computeOffset(position1, distance, heading - assumedError);
        updatePolyline(polyPRef.current, [position1, positionP]);
        updatePolyline(polySRef.current, [position1, positionS]);

        setPositionLine({
            id: "1",
            centerLine: [position1, position2],
            starboardLine: polySRef.current ? [position1, positionS] : [],
            portLine: polyPRef.current ? [position1, positionP] : [],
            assumedError: assumedError || 0,
            open: false,
            draggable: false,
        });
    }, [assumedError, distance, geometryLib, heading, setPositionLine]);

    useEffect(() => {
        if (!markerRef.current) return;
        console.log("LineOfPosition: useEffect 2");
        markerRef.current.addListener("position_changed", updatePosition);
        markerRef.current.addListener("click", () => {
            setIsOpen(true);
            console.log("LineOfPosition: marker click");
        })
        // markerRef.current?.addListener("position_changed", updatePosition)
        return () => {
            // Cleanup listeners if component is unmounted
            if (!markerRef.current) return;
            google.maps.event.clearListeners(markerRef.current, "position_changed");
            google.maps.event.clearListeners(markerRef.current, "click");
        };
    }, [markerRef.current, updatePosition]);


    // Update polyline path
    function updatePolyline(polyline: google.maps.Polyline, path: LatLng[]) {
        if (polyline) {
            polyline.setPath(path);
        }
    }

    useEffect(() => {
        console.log("LineOfPosition: useEffect 3");
        updatePosition();
    }, [heading]);


    return <>{children}</>

    // return <>
        {/*{isOpen && (*/}
        {/*    <InfoWindow anchor={markerRef.current} onCloseClick={() => setIsOpen(false)}>*/}
        {/*        <p className="w-[200px] h-[200px]">*/}
        {/*            Hello*/}
        {/*        </p>*/}
        {/*    </InfoWindow>*/}
        {/*)}*/}

        {/*{markerRef.current && isOpen && (*/}
        {/*    <InfoWindow2*/}
        {/*        anchor={markerRef.current}*/}
        {/*        // options={{*/}
        {/*        //     pixelOffset: new google.maps.Size(0, -30),*/}
        {/*        //     content: "Drag me",*/}
        {/*        // }}*/}
        {/*    >*/}
        {/*        <*/}
        {/*            div*/}
        {/*            style={{*/}
        {/*                backgroundColor: "white",*/}
        {/*                padding: 10,*/}
        {/*                borderRadius: 5,*/}
        {/*            }}*/}
        {/*        >*/}
        {/*            <div>Drag me</div>*/}
        {/*        </div>*/}

        {/*    </InfoWindow2>*/}

        {/*)}*/}


        {/*</InfoWindow2>*/}
        {/*<AdvancedMarker*/}
        {/*    position={position}*/}
        {/*    draggable={true}*/}
        {/*    onDrag={(e: google.maps.MapMouseEvent) => {*/}
        {/*        if (!e.latLng) return;*/}
        {/*        setPosition({lat: e.latLng.lat(), lng: e.latLng.lng()});*/}
        {/*    }}*/}
        {/*    onDragEnd={(e: google.maps.MapMouseEvent) => {*/}
        {/*        if (!e.latLng) return;*/}
        {/*        setPosition({lat: e.latLng.lat(), lng: e.latLng.lng()});*/}
        {/*    }}*/}
        {/*>*/}
        {/*    <Pin>*/}

        {/*    </Pin>*/}
        {/*</AdvancedMarker>*/}
    {/*</>;*/}
};

export default React.memo(LineOfPosition);

