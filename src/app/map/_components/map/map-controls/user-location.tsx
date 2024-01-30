"use client";

import BaseButton from "./base-button";
import {UserCircleIcon} from "@heroicons/react/24/outline";
import React, {useContext} from "react";
import {useMap} from "@vis.gl/react-google-maps";
import {cn} from "@/lib/utils";
import {toast} from "sonner";
import {AppContext} from "@/app/app";
// import { useGeolocation } from "@uidotdev/usehooks";

const RecenterControl = ({className}: { className?: string }) => {
    const map = useMap();
    const state = useContext(AppContext).state;

    const handleClick = () => {
        if (!map) return;
        if (state.location.loading) {
            toast.info("Location is loading...");  // Inform the user that location is loading
            return;
        }
        if (state.location.error) {
            toast.error(`Error: ${state.location.error}`);  // Show error message if any
            return;
        }
        if (!state.location.value) {
            toast.info("Enable location services to use this feature"); // Prompt to enable location
            return;
        }

        // If all is good, recenter the map to the user's location
        map.setZoom(15);
        map.panTo({
            lat: state.location.value.coords.latitude,
            lng: state.location.value.coords.longitude
        });
    };

    return (
        <BaseButton className={cn("bg-white dark:bg-zinc-800", className)}
                    onClick={handleClick}
        >
            <UserCircleIcon className="w-6 h-6"/>
        </BaseButton>
    );
}

export default RecenterControl;
