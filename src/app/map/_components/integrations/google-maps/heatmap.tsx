"use client";

import {useMap, useMapsLibrary} from "@vis.gl/react-google-maps";
import {useTheme} from "next-themes";
import {useEffect, useRef} from "react";
import {toast} from "sonner";
import MVCArray = google.maps.MVCArray;
import WeightedLocation = google.maps.visualization.WeightedLocation;
import LatLng = google.maps.LatLng;

const HeatmapLayer = ({data, options}: {
        data: MVCArray<LatLng | WeightedLocation> | (LatLng | WeightedLocation)[],
        options?: Omit<google.maps.visualization.HeatmapLayerOptions, "data">
    }) => {
        const map = useMap();
        const theme = useTheme();
        const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
        const visualization = useMapsLibrary("visualization");

        // Initialize MarkerClusterer
        useEffect(() => {
            if (!map) return;
            if (!visualization) return;
            if (!heatmapRef.current) {
                heatmapRef.current = new visualization.HeatmapLayer({data, ...options});
                heatmapRef.current.setMap(map);
                toast.info("Initializing heatmap layer");
                return () => {
                    toast.info("Removing heatmap layer");
                    heatmapRef.current?.setMap(null);
                    heatmapRef.current = null;
                }
            }
        }, [data, options, visualization, map]);
        return <></>
    }
;

export default HeatmapLayer;