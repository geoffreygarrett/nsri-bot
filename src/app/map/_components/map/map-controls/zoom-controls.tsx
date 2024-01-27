import {useMap} from "@vis.gl/react-google-maps";
import BaseButton from "./base-button";
import {MinusIcon, PlusIcon} from "@heroicons/react/24/outline";
import React from "react";

const ZoomIn = ({orientation, className}: { orientation: 'vertical' | 'horizontal', className?: string }) => {
    const map = useMap();

    const zoomIn = () => {
        if (map) {
            const currentZoom = map.getZoom() || 0;
            map.setZoom(currentZoom + 1); // Adjust the zoom level increment as needed
        }
    };

    return (
        <BaseButton onClick={zoomIn} className={className}>
            {/* Replace with your preferred icon or text */}
            <PlusIcon className="w-6 h-6"/>
        </BaseButton>
    );
};

const ZoomOut = ({orientation, className}: { orientation: 'vertical' | 'horizontal', className?: string }) => {
    const map = useMap();

    const zoomOut = () => {
        if (map) {
            const currentZoom = map.getZoom() || 0;
            map.setZoom(currentZoom - 1); // Adjust the zoom level decrement as needed
        }
    };

    return (
        <BaseButton onClick={zoomOut} className={className}>
            {/* Replace with your preferred icon or text */}
            <MinusIcon className="w-6 h-6"/>
        </BaseButton>
    );
};

export default function ZoomControls({className}: { className?: string }) {
    return (
        <div
            className="flex flex-col items-center justify-center space-y-0 mb-2 mr-2 border border-gray-400 dark:border-gray-600">
            <ZoomIn orientation="vertical" className="px-2 border-b border-gray-400 dark:border-gray-700"/>
            <ZoomOut orientation="vertical" className="px-2 border-t border-gray-400 dark:border-gray-700"/>
        </div>
    );
}