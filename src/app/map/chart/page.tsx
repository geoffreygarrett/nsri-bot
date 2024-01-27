"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import * as turf from '@turf/turf'
import LineOfPosition from "@/app/map/chart/line-of-positon";
import {ControlPosition, MapControl, useMap, useMapsLibrary} from "@vis.gl/react-google-maps";
import {Input} from "@/components/ui/input";
import LayerCombobox from "@/app/map/_components/map/map-controls/layer-combobox";
import {Polygon as PolygonType} from "geojson";
import {InfoWindow} from "@/app/map/_components/integrations/google-maps/draw/info-window";
import {Polygon, usePolygonRef} from "@/app/map/_components/integrations/google-maps/draw/polygon";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useTheme} from "next-themes";
import DrawingManagerComponent, {
    DrawingMode
} from "@/app/map/_components/integrations/google-maps/draw/drawing-manager";

const lineIntersect = require('@turf/line-intersect').default;
const helpers = require('@turf/helpers');
import {usePermission} from "react-permission-role";
import GridlineComponent from "@/app/map/_components/integrations/google-maps/draw/gridline";


const Page: React.FC = () => {
    const {isAuthorized, isLoading} = usePermission();

    interface LineOfPosition {
        id: string | number;
        assumedError: number;
        centerLine: google.maps.LatLng[] | null;
        starboardLine: google.maps.LatLng[] | null;
        portLine: google.maps.LatLng[] | null;
        open: boolean;
        draggable: boolean;
    }

    function useDebouncedEffect(effect: React.EffectCallback, delay: number, deps?: React.DependencyList) {
        useEffect(() => {
            const handler = setTimeout(() => effect(), delay);
            return () => clearTimeout(handler);
        }, [...deps || [], delay]);
    }

    const [positionLine1, setPositionLine1] = useState<LineOfPosition | null>(null);
    const [positionLine2, setPositionLine2] = useState<LineOfPosition | null>(null);
    const [intersections, setIntersections] = useState<number[][] | null>(null);
    const [heading1, setHeading1] = useState<number>(90);
    const [heading2, setHeading2] = useState<number>(180);
    const [centerIntersection, setCenterIntersection] = useState<number[] | null>(null);

    const calculateIntersections = useCallback(() => {
        if (!positionLine1 || !positionLine2) return;
        let results = [];
        const lines1 = [positionLine1.starboardLine, positionLine1.portLine];
        const lines2 = [positionLine2.starboardLine, positionLine2.portLine];
        const indexOrder1 = [0, 0, 1, 1];
        const indexOrder2 = [0, 1, 1, 0];

        // center intersection
        const centerLine1 = positionLine1.centerLine;
        const centerLine2 = positionLine2.centerLine;
        if (centerLine1 && centerLine2) {
            const intersects = lineIntersect(
                turf.lineString(centerLine1.map(pos => [pos.lng(), pos.lat()])),
                turf.lineString(centerLine2.map(pos => [pos.lng(), pos.lat()]))
            );
            if (intersects.features.length > 0) {
                setCenterIntersection(intersects.features[0].geometry.coordinates);
            }
        }
        // calculate intersections using index order
        for (let i = 0; i < 4; i++) {
            const line1 = lines1[indexOrder1[i]];
            const line2 = lines2[indexOrder2[i]];
            if (!line1 || !line2) continue;
            const intersects = lineIntersect(
                turf.lineString(line1.map(pos => [pos.lng(), pos.lat()])),
                turf.lineString(line2.map(pos => [pos.lng(), pos.lat()]))
            );
            if (intersects.features.length === 0) continue;
            results.push(intersects.features[0].geometry.coordinates);
        }

        results.push(results[0])
        setIntersections(results);
        console.log(results)
    }, [positionLine1, positionLine2]);

    useEffect(() => {
        if (!positionLine1 || !positionLine2) return;
        calculateIntersections();

        // isAuthorized([`station-admin-${42}`],['abc']).then((result) => {
        //     console.log("isAuthorized", result)
        // });

    }, [positionLine1, positionLine2, calculateIntersections]);

    const regionPolygonRef = useRef<google.maps.Polygon | null>(null);
    const map = useMap();
    // useEffect(() => {
    //     // if
    //     if (!map) return;
    //     // reorder the intersections in clockwise
    //     if (!intersections) return;
    //     if (!centerIntersection) return;
    //     const region_polygon = new google.maps.Polygon({
    //         paths: intersections,
    //         strokeColor: "#c30b0b",
    //         strokeOpacity: 0.8,
    //         strokeWeight: 2,
    //         fillColor: "#ce2a56",
    //         fillOpacity: 0.3,
    //         map: map
    //     });
    //     return () => {
    //         region_polygon?.setMap(null);
    //     }
    // }, [intersections]);

    // function createPolygonFromLine(lineData: LineOfPosition): PolygonType {
    //     const {from, heading, distance, error} = lineData;
    //
    //     // Starting point
    //     const startPoint = turf.point([from.lng, from.lat]);
    //
    //     // Calculating the endpoint (apex of the triangle)
    //     const endPoint = turf.destination(startPoint, distance / 1000, heading, 'kilometers');
    //
    //     // Calculate left and right points to form a triangular polygon
    //     const leftPoint = turf.destination(
    //         startPoint, distance / 1000, heading - error, 'kilometers');
    //     const rightPoint = turf.destination(
    //         startPoint, distance / 1000, heading + error, 'kilometers');
    //
    //     // Create a polygon using the three points
    //     const triangleCoords = [
    //         startPoint.geometry.coordinates,
    //         leftPoint.geometry.coordinates,
    //         endPoint.geometry.coordinates,
    //         rightPoint.geometry.coordinates,
    //         startPoint.geometry.coordinates // Close the loop
    //     ];
    //
    //     const polygon = turf.polygon([triangleCoords]);
    //     return polygon;
    // }

    const [polygonRef, polygon] = usePolygonRef();

    useEffect(() => {
        console.log(intersections)
    }, [intersections]);

    const convertToLatLng = (coordinates: number[][]): google.maps.LatLng[] => {
        if (!coordinates) return [];
        if (!coordinates[0] || !coordinates[0][0]) return [];
        return coordinates.map((coordinate) => {
            return new google.maps.LatLng(coordinate[1], coordinate[0]);
        });
    }

    const calculateArea = (intersections: number[][]): number => {
        if (!intersections) return 0;
        if (intersections.length < 4) return 0;
        return turf.area(turf.polygon([intersections])) / 1000000
    }

    const horizonDistanceMetricKM = (height: number): number => {
        return Math.sqrt(height) * 3.56972
    }

    const [polygonInfoOpen, setPolygonInfoOpen] = useState<boolean>(false);

    // import { Polyline } from "@react-google-maps/api"; // Assuming you're using @react-google-maps/api package
    // interface GridlineProps {
    //     map: google.maps.Map;
    //     interval: number; // degrees between each line, smaller values mean more lines
    //     bounds: {
    //         north: number;
    //         south: number;
    //         east: number;
    //         west: number;
    //     };
    // }
    //
    // const drawGridlines = ({map, interval, bounds}: GridlineProps) => {
    //     const createLine = (path: google.maps.LatLngLiteral[]) => {
    //         return new google.maps.Polyline({
    //             path: path,
    //             geodesic: true,
    //             strokeColor: "#232323",
    //             strokeOpacity: 0.5,
    //             strokeWeight: 1,
    //             map: map
    //         });
    //     };
    //
    //     // Draw Latitude Lines within bounds
    //     for (let lat = Math.ceil(bounds.south / interval) * interval; lat <= bounds.north; lat += interval) {
    //         const latLinePath = [
    //             {lat: lat, lng: bounds.west},
    //             {lat: lat, lng: bounds.east}
    //         ];
    //         createLine(latLinePath);
    //     }
    //
    //     // Draw Longitude Lines within bounds
    //     for (let lng = Math.ceil(bounds.west / interval) * interval; lng <= bounds.east; lng += interval) {
    //         const lngLinePath = [
    //             {lat: bounds.south, lng: lng},
    //             {lat: bounds.north, lng: lng}
    //         ];
    //         createLine(lngLinePath);
    //     }
    // };
    //
    // // Example usage
    // // Assuming you have a google.maps.Map instance named 'map'
    // // // Define the bounds for the gridlines
    // // const gridBounds = {
    // //     north: 50,
    // //     south: 30,
    // //     east: 10,
    // //     west: -10
    // // };
    //
    // // Call this inside a useEffect if you're using React
    // useEffect(() => {
    //     if (!map) return;
    //     if (!map.getBounds() || map.getBounds() == undefined) return;
    //     // add listener to map
    //     map.addListener('bounds_changed', () => {
    //         console.log("bounds changed")
    //         drawGridlines({
    //             map: map, interval: 0.5, bounds: {
    //                 north: map.getBounds().getNorthEast().lat(),
    //                 south: map.getBounds().getSouthWest().lat(),
    //                 east: map.getBounds().getNorthEast().lng(),
    //                 west: map.getBounds().getSouthWest().lng(),
    //             }
    //         });
    //     });
    //
    //     // drawGridlines({
    //     //     map: map, interval: 0.5, bounds: {
    //     //         north: map.getBounds().getNorthEast().lat(),
    //     //         south: map.getBounds().getSouthWest().lat(),
    //     //         east: map.getBounds().getNorthEast().lng(),
    //     //         west: map.getBounds().getSouthWest().lng(),
    //     //     }
    //     // });
    // }, [map, map?.getBounds()]);

    const {resolvedTheme} = useTheme();
    const getGridlineConfig = useCallback((zoom: number) => {
        const isDarkTheme = resolvedTheme === 'dark';

        // Dark theme colors
        const lightMajorColor = '#000000'; // Darker color for major gridlines
        const lightMinorColor = '#252525'; // Lighter color for minor gridlines

        // Light theme colors
        const darkMajorColor = '#BBBBBB'; // Darker color for major gridlines
        const darkMinorColor = '#DDDDDD'; // Lighter color for minor gridlines

        // Choose color based on theme
        const majorColor = isDarkTheme ? darkMajorColor : lightMajorColor;
        const minorColor = isDarkTheme ? darkMinorColor : lightMinorColor;

        console.log("Zoom:", zoom)
        // Adjust intervals based on zoom
        if (zoom > 20) {
            // Finest grid at high zoom - every 6 seconds (0.00167 degrees)
            return {
                major: {interval: 1 / 60 / 60, color: majorColor, weight: 2},
                minor: {interval: 1 / 60 / 60 / 5, color: minorColor, weight: 1}
            };
        } else if (zoom > 16.5) {
            // Finest grid at high zoom - every 6 seconds (0.00167 degrees)
            return {
                major: {interval: 1 / 60 / 5, color: majorColor, weight: 2},
                minor: {interval: 1 / 60 / 60, color: minorColor, weight: 1}
            };
        } else if (zoom > 12.5) {
            // Every 1 minute (0.0167 degrees) and 6 minutes (0.1 degrees)
            return {
                major: {interval: 1 / 60, color: majorColor, weight: 2}, // Every 6 minutes
                minor: {interval: 1 / 60 / 5, color: minorColor, weight: 1} // Every minute
            };
        } else if (zoom > 10) {
            // Every 5 minutes (0.0833 degrees) and 1 minute (0.0167 degrees)
            return {
                major: {interval: 1 / 10, color: majorColor, weight: 2}, // Every 5 minutes
                minor: {interval: 1 / 60, color: minorColor, weight: 1} // Every minute
            };
        } else if (zoom > 7) {
            // Every 30 minutes (0.5 degrees) and 6 minutes (0.1 degrees)
            return {
                major: {interval: 1, color: majorColor, weight: 2}, // Every 30 minutes
                minor: {interval: 1 / 10, color: minorColor, weight: 1} // Every 6 minutes
            };
        }
        //
        // else if (zoom > 6) {
        //     // Every 1 degree and 30 minutes (0.5 degrees)
        //     return {
        //         major: {interval: 1, color: majorColor, weight: 2}, // Every degree
        //         minor: {interval: 0.5, color: minorColor, weight: 1} // Every 30 minutes
        //     };
        // }

        // Default configuration for the lowest zoom levels
        return {
            major: {interval: 5, color: majorColor, weight: 2}, // Every 2 degrees
            minor: {interval: 1, color: minorColor, weight: 1} // Every degree
        };
    }, [resolvedTheme])

    const drawingLib = useMapsLibrary('drawing');

    const [polygonRef2, polygon2] = usePolygonRef();

    // const [polygonPaths, setPolygonPaths] = useState<number[][][]>([]);
    function convertToLatLng2(paths: number[][][]): google.maps.LatLng[][] {
        return paths.map(path => {
            return path.map(coord => new google.maps.LatLng(coord[0], coord[1]));
        });
    }

    function convertToLatLng3(paths: number[][]) {
        return paths.map(coord => new google.maps.LatLng(coord[0], coord[1]));
    }

    const [polygonPaths, setPolygonPaths] = useState<number[][][]>([]);

    const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
        const newPolygonPath = polygon.getPath().getArray().map(pos => [pos.lat(), pos.lng()]);
        setPolygonPaths(currentPaths => [...currentPaths, newPolygonPath]);
        polygon.setMap(null);
    }, []);

    return (
        <>
            <GridlineComponent getGridlineConfig={getGridlineConfig}/>


            {/*{drawingLib && (*/}
            {/*    <DrawingManagerComponent*/}
            {/*        drawingMode={DrawingMode.POLYGON}*/}
            {/*        options={{drawingControl: false}}*/}
            {/*        onPolygonComplete={onPolygonComplete}*/}
            {/* />*/}
            {/*)}*/}
            {/*create all polygons */}
            {polygonPaths.map((path, index) => {
                return (
                    <Polygon
                        key={`polygon-${polygonPaths.length}-${index}`}  // Key based on state length
                        paths={convertToLatLng3(path)}
                        strokeColor="#c30b0b"
                        strokeOpacity={0.8}
                        editable={true}
                        strokeWeight={2}
                        fillColor="#ce2a56"
                        fillOpacity={0.3}/>
                )

            })}
            {/* Custom layer combobox */}
            <MapControl position={ControlPosition.TOP_LEFT}>
                <LayerCombobox className="ml-2 mt-2 border border-gray-400 dark:border-gray-600 mt-[3.5rem]"/>
            </MapControl>

            <MapControl position={ControlPosition.TOP_LEFT}>
                <Input className="ml-2 mt-2 border border-gray-400 dark:border-gray-600 mt-[3.5rem] h-10"
                       type="number"
                       defaultValue={heading1}
                       step={0.5}
                       onChange={(e) => {
                           setHeading1(parseFloat(e.target.value));
                       }}/>
            </MapControl>

            <MapControl position={ControlPosition.TOP_LEFT}>
                <Input className="ml-2 mt-2 border border-gray-400 dark:border-gray-600 mt-[3.5rem] h-10"
                       type="number"
                       step={0.5}
                       defaultValue={heading2}
                       onChange={(e) => {
                           setHeading2(parseFloat(e.target.value));
                       }}/>
            </MapControl>

            {intersections && centerIntersection && (
                <Polygon
                    ref={polygonRef}
                    paths={convertToLatLng(intersections)}
                    strokeColor="#c30b0b"
                    onClick={() => {
                        setPolygonInfoOpen(!polygonInfoOpen)
                    }}
                    strokeOpacity={0.8}
                    strokeWeight={2}
                    fillColor="#ce2a56"
                    fillOpacity={0.3}>
                    {polygonInfoOpen && (
                        <InfoWindow
                            position={{lat: centerIntersection[1], lng: centerIntersection[0]}}
                            onCloseClick={() => setPolygonInfoOpen(false)}>
                            <Card className={'rounded-none'}>
                                <CardContent className={'rounded-none'}>
                                    <CardHeader>
                                        <CardTitle>
                                            Area: {calculateArea(intersections).toFixed(2)} km<sup>2</sup>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardDescription>
                                        <ul>
                                            <li>Heading 1: {heading1.toFixed(2)}</li>
                                            <li>Heading 2: {heading2.toFixed(2)}</li>
                                        </ul>
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </InfoWindow>
                    )}
                </Polygon>
            )}


            <LineOfPosition
                from={{lat: -34.12517, lng: 19.0356486}}
                heading={heading1}
                distance={horizonDistanceMetricKM(1.8 + 4) * 1000}
                assumedError={4}
                setPositionLine={setPositionLine1}>
                {}
            </LineOfPosition>

            <LineOfPosition
                from={{lat: -34.12517, lng: 19.0356486}}
                heading={heading2}
                distance={horizonDistanceMetricKM(1.8 + 4) * 1000}
                assumedError={4}
                setPositionLine={setPositionLine2}/>
        </>
    )
}
export default Page;