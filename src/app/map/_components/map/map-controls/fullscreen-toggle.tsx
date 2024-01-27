import {useMap} from "@vis.gl/react-google-maps";
import React, {useEffect, useState} from "react";
import {ArrowsPointingInIcon, ArrowsPointingOutIcon} from "@heroicons/react/24/outline";
import BaseButton from "./base-button";
import screenfull from 'screenfull';
import {toast} from "sonner";

const FullScreenToggle = ({className}: { className?: string }) => {
    const map = useMap();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Event handler for fullscreen changes
    const handleFullscreenChange = () => {
        const fullscreenElement = document.fullscreenElement;
        setIsFullscreen(!!fullscreenElement);
    };

    useEffect(() => {
        // Listen for fullscreen change events
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        // Cleanup event listener
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []); // Empty array ensures effect runs only once

    const toggleFullscreen = () => {
        if (map) {
            if (screenfull.isEnabled) {
                if (!screenfull.isFullscreen) {
                    screenfull.request(document.body).then(() => {
                        console.log('Fullscreen enabled');
                    });
                } else {
                    screenfull.exit().then(() => {
                        console.log('Fullscreen disabled');
                    });
                }

            } else {
                toast.error('Fullscreen is not supported in this browser');
            }
        }
    };

    return (
        <BaseButton onClick={toggleFullscreen} className={className} disabled={!screenfull.isEnabled}>
            {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6"/> :
                <ArrowsPointingOutIcon className="w-6 h-6"/>}
        </BaseButton>
    );
};

export default FullScreenToggle;
