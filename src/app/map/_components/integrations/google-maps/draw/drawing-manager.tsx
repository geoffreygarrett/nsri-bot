// DrawingManagerComponent.tsx

import React, {useEffect, useState} from 'react';
import {useMap, useMapsLibrary} from '@vis.gl/react-google-maps';

// Define types for the DrawingManagerProps
export interface DrawingManagerProps {
    onCircleComplete?: (circle: google.maps.Circle) => void;
    onMarkerComplete?: (marker: google.maps.Marker) => void;
    onPolygonComplete?: (polygon: google.maps.Polygon) => void;
    onPolylineComplete?: (polyline: google.maps.Polyline) => void;
    onRectangleComplete?: (rectangle: google.maps.Rectangle) => void;
    onOverlayComplete?: (event: google.maps.drawing.OverlayCompleteEvent) => void;
    options?: google.maps.drawing.DrawingManagerOptions;
    drawingMode?: DrawingMode;
}

export enum DrawingMode {
    CIRCLE = 'circle',
    MARKER = 'marker',
    POLYGON = 'polygon',
    POLYLINE = 'polyline',
    RECTANGLE = 'rectangle',
}

export const DrawingManagerComponent: React.FC<DrawingManagerProps> = ({
                                                                           onCircleComplete,
                                                                           onMarkerComplete,
                                                                           onPolygonComplete,
                                                                           onPolylineComplete,
                                                                           onRectangleComplete,
                                                                           onOverlayComplete,
                                                                           drawingMode,
                                                                           options,
                                                                       }) => {
    const map = useMap();
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const drawingLib = useMapsLibrary('drawing');


    useEffect(() => {
        if (!map) return;
        if (!drawingLib) return;

        const manager = new drawingLib.DrawingManager(options || {});
        manager.setMap(map);
        setDrawingManager(manager);

        return () => {
            manager.setMap(null);
        };
    }, [map, options, drawingLib]);

    // Set drawing mode
    useEffect(() => {
        if (!drawingManager || !drawingLib || !drawingMode) return;
        switch (drawingMode) {
            case DrawingMode.CIRCLE:
                drawingManager.setDrawingMode(drawingLib.OverlayType.CIRCLE);
                break;
            case DrawingMode.MARKER:
                drawingManager.setDrawingMode(drawingLib.OverlayType.MARKER);
                break;
            case DrawingMode.POLYGON:
                drawingManager.setDrawingMode(drawingLib.OverlayType.POLYGON);
                break;
            case DrawingMode.POLYLINE:
                drawingManager.setDrawingMode(drawingLib.OverlayType.POLYLINE);
                break;
            case DrawingMode.RECTANGLE:
                drawingManager.setDrawingMode(drawingLib.OverlayType.RECTANGLE);
                break;
        }
    }, [drawingManager, drawingMode, drawingLib]);

    // Register event listeners
    useEffect(() => {
        if (!drawingManager) return;

        const listeners = [
            onCircleComplete && google.maps.event.addListener(drawingManager, 'circlecomplete', onCircleComplete),
            onMarkerComplete && google.maps.event.addListener(drawingManager, 'markercomplete', onMarkerComplete),
            onPolygonComplete && google.maps.event.addListener(drawingManager, 'polygoncomplete', onPolygonComplete),
            onPolylineComplete && google.maps.event.addListener(drawingManager, 'polylinecomplete', onPolylineComplete),
            onRectangleComplete && google.maps.event.addListener(drawingManager, 'rectanglecomplete', onRectangleComplete),
            onOverlayComplete && google.maps.event.addListener(drawingManager, 'overlaycomplete', onOverlayComplete),
        ].filter(Boolean);

        return () => {
            listeners.forEach(listener => {
                if (listener) google.maps.event.removeListener(listener)
            });
        };
    }, [
        drawingManager,
        onCircleComplete,
        onMarkerComplete,
        onPolygonComplete,
        onPolylineComplete,
        onRectangleComplete,
        onOverlayComplete,
    ]);

    return null; // This component does not render anything itself
};

export default DrawingManagerComponent;
