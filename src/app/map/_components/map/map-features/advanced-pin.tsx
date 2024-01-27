import React from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {PencilSquareIcon} from "@heroicons/react/24/solid";

export interface AdvancedPinProps {
    children: React.ReactNode,
    draggable?: boolean,
    synchronized?: boolean,
    selected?: boolean,
}

export const AdvancedPin: React.FC<AdvancedPinProps> = ({children, draggable, synchronized, selected}) => {
    return (
        <>
            {draggable && (
                <XMarkIcon
                    className="h-10 w-10 stroke-1 absolute bottom-0 -translate-x-1/2 left-1/2 translate-y-1/2"/>
            )}
            {!synchronized && (
                <PencilSquareIcon ///ExclamationCircleIcon
                    className="h-6 w-6 top-0 right-0 -mt-2 -mr-2 absolute text-red-600 dark:text-red-400 animate-pulse bg-white rounded bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70"/>
            )}
            {selected && (
                <svg height="100" width="100"
                     className="absolute bottom-0 -translate-x-1/2 left-1/2 translate-y-1/3 stroke-blue-600 animate-pulse z-10">
                    <rect x="30" y="20" width="40" height="60" rx="15" ry="15"
                          style={{fill: 'none', strokeWidth: 3}}/>
                </svg>
            )}
            {children}
        </>
    )
}