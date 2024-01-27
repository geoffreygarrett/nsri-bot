"use client";

import React from "react";
import {cn} from "@/lib/utils";
import {useMapContext} from "@/components/map-context/map-context";
import {Transition} from "@headlessui/react";
import {Cog6ToothIcon} from "@heroicons/react/24/outline";

const Waves: React.FC<{ className?: string, animate?: boolean }> = ({className, animate}) => {
    return (
        <svg className={cn("", className)}
             xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
             viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"/>
            </defs>
            <g className={cn(animate ? "parallax" : "")}>
                <use xlinkHref="#gentle-wave" x="48" y="0" className="dark:fill-white opacity-70 fill-blue-300"/>
                <use xlinkHref="#gentle-wave" x="48" y="3" className="dark:fill-white opacity-50 fill-blue-300"/>
                <use xlinkHref="#gentle-wave" x="48" y="5" className="dark:fill-white opacity-30 fill-blue-300"/>
                <use xlinkHref="#gentle-wave" x="48" y="7" className="dark:fill-white opacity-10 fill-blue-300"/>
            </g>
        </svg>
    );
};

const MapLoading = ({className, tilesLoaded, animate=true}: {
    className?: string,
    tilesLoaded: boolean,
    animate?: boolean
}) => {
    const {apiIsLoaded, mapInitialized} = useMapContext();
    return (
        <Transition
            appear={true}
            show={!apiIsLoaded || !mapInitialized || !tilesLoaded}
            enter="transition transition-opacity duration-1000 ease-in-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform duration-500 transition ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className={cn("flex items-center justify-center h-full w-full absolute top-0 bg-glassy", className,
                "bg-white bg-opacity-20 backdrop-blur-sm drop-shadow-lg")}
        >
            <div className="flex flex-col items-center justify-center">
                <Cog6ToothIcon className="h-16 w-16 animate-spin"/>
                <div
                    className="text-gray-800 dark:text-gray-200 text-xxs items-center justify-center text-center text-bold">
                    {apiIsLoaded ?
                        (!mapInitialized ? 'Loading map...' : (!tilesLoaded ? 'Loading tiles...' : 'Map loaded!'))
                        : 'Loading API...'}
                </div>
                {/* make waves svg aligned with bottom, full width scale */}
                <Waves
                    animate={animate}
                    className="absolute bottom-0 left-0 w-full transform scale-x-150 scale-y-50 translate-y-1/4 opacity-50"/>
            </div>
        </Transition>
    );
};


export default MapLoading;