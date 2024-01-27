import React, {useCallback, useEffect, useRef} from "react";
import {useMap} from "@vis.gl/react-google-maps";

interface GridlineConfig {
    interval: number;
    color: string;
    weight: number;
}

interface GridlineConfigMapping {
    major: GridlineConfig;
    minor: GridlineConfig;
}

interface GridlineComponentProps {
    getGridlineConfig: (zoom: number) => GridlineConfigMapping;
}

interface GridlineProps {
    interval: number;
    bounds: google.maps.LatLngBoundsLiteral;
    color: string;
    weight: number;
}

const GridlineComponent: React.FC<GridlineComponentProps> = ({getGridlineConfig}) => {
    const map = useMap();
    const gridlinesRef = useRef<google.maps.Polyline[]>([]);

    const clearGridlines = (): void => {
        gridlinesRef.current.forEach(line => line.setMap(null));
        gridlinesRef.current = [];
    };

    const createLine = (path: google.maps.LatLngLiteral[], color: string, weight: number): google.maps.Polyline => {
        const line = new google.maps.Polyline({
            path: path,
            geodesic: false,
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: weight,
            map: map
        });
        gridlinesRef.current.push(line);
        return line;
    };

    const drawGridlines = useCallback((gridlinePropsArray: GridlineProps[]) => {
        clearGridlines();

        if (!map) return;

        gridlinePropsArray.forEach(({interval, bounds, color, weight}) => {
            const startLat = Math.floor(bounds.south / interval) * interval;
            const startLng = Math.floor(bounds.west / interval) * interval;

            for (let lat = startLat; lat <= bounds.north; lat += interval) {
                if (lat >= bounds.south && lat <= bounds.north) {
                    createLine([{lat, lng: bounds.west}, {lat, lng: bounds.east}], color, weight);
                }
            }

            for (let lng = startLng; lng <= bounds.east; lng += interval) {
                if (lng >= bounds.west && lng <= bounds.east) {
                    createLine([{lat: bounds.south, lng}, {lat: bounds.north, lng}], color, weight);
                }
            }
        });
    }, [map, createLine]);

    useEffect(() => {
        if (!map) return;

        const updateGridlines = () => {
            const bounds = map.getBounds();
            const zoom = map.getZoom();
            if (!bounds || zoom === undefined) return;

            const config = getGridlineConfig(zoom);
            const boundsLiteral: google.maps.LatLngBoundsLiteral = {
                north: bounds.getNorthEast().lat(),
                south: bounds.getSouthWest().lat(),
                east: bounds.getNorthEast().lng(),
                west: bounds.getSouthWest().lng()
            };

            // Combine major and minor gridlines in a single batch
            drawGridlines([
                {
                    interval: config.major.interval,
                    bounds: boundsLiteral,
                    color: config.major.color,
                    weight: config.major.weight
                },
                {
                    interval: config.minor.interval,
                    bounds: boundsLiteral,
                    color: config.minor.color,
                    weight: config.minor.weight
                }
            ]);
        };

        const boundsListener = map.addListener('bounds_changed', updateGridlines);
        const zoomListener = map.addListener('zoom_changed', updateGridlines);

        updateGridlines(); // Initial draw

        return () => {
            boundsListener.remove();
            zoomListener.remove();
            clearGridlines();
        };
    }, [map, drawGridlines, getGridlineConfig]);

    return null;
};

export default GridlineComponent;
