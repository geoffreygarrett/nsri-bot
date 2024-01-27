import {Tables} from "@/types/supabase";
import React, {Dispatch, ReactNode, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Transition} from "@headlessui/react";
import {cn} from "@/lib/utils";
import {LifeBuoyIcon} from "lucide-react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {LockClosedIcon, LockOpenIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {PencilSquareIcon} from "@heroicons/react/24/solid";
import {isRescueBuoy} from "@/app/map/map";


export type EditNavButton = {
    icon: ReactNode;
    onClick?: () => void;
    panelContent?: ReactNode;
    nestedButtons?: EditNavButton[];
    condition?: boolean;
};

export type EditNavProps = {
    editState: EditState;
    setEditState: Dispatch<SetStateAction<EditState>>;
    icon: ((item: any) => ReactNode) | ReactNode;
    name: ((item: any) => string) | string;
    buttons: EditNavButton[];
    className?: string;
};

export interface EditState {
    focused: Tables<'rescue_buoys'> | Tables<'nsri_stations'> | null;
    locked: boolean;
    open: boolean;
    mode: 'edit' | 'view';
    typeSpecific?: Record<string, any>;
    activePanelIndex?: number | null;
    formOpen: boolean;
}


const _EditNav = ({editState, setEditState, icon, name, buttons, className}: EditNavProps) => {
    const buttonRefs = useRef<HTMLElement[] | null[]>([]);

    useEffect(() => {
        buttonRefs.current = buttonRefs.current.slice(0, buttons.length);
    }, [buttons]);

    useEffect(() => {
        buttonRefs.current = buttonRefs.current.slice(0, buttons.length);
    }, [editState.activePanelIndex, buttons.length]);

    if (!editState.focused) {
        return null;
    }

    const handleButtonClick = (index: number, button: EditNavButton) => {
        // if (button.nestedButtons) {
        setEditState(prevState => ({
            ...prevState,
            activePanelIndex: prevState.activePanelIndex === index ? null : index
        }));
        if (button.onClick) {
            button.onClick();
        }
    };

    const iconRender = typeof icon === 'function' ? icon(editState.focused) : icon;
    const nameRender = typeof name === 'function' ? name(editState.focused) : name;

    return (
        <>
            <div
                className={cn("flex flex-col items-stretch bg-white dark:bg-zinc-900 border border-gray-400 dark:border-gray-600 rounded overflow-hidden sm:h-10 h-11 max-w-full w-screen sm:w-[400px] md:w-[400px]", className)}>
                <div className="flex items-center h-full relative">
                    <div className="flex-shrink-0 flex justify-center items-center w-10 p-2">
                        {iconRender}
                    </div>
                    <span
                        className="flex-grow flex items-center ml-2 mr-2 text-ellipsis overflow-hidden whitespace-nowrap text-sm">
                        {nameRender}
                    </span>
                    {buttons.map((button, index) => button.condition !== false && (
                        <div
                            ref={el => buttonRefs.current[index] = el}
                            key={`button-${index}`} className="flex flex-col items-center relative">
                            <Button
                                onClick={() => handleButtonClick(index, button)}
                                className="justify-center items-center h-full w-11 sm:w-10 m-0 p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                                key={`button-${index}`}>
                                {button.icon}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            {editState.activePanelIndex != null && buttons[editState.activePanelIndex].panelContent && (
                <div
                    className={cn("flex flex-col items-center w-full absolute z-30 left-0",
                        // "max-w-full w-screen sm:w-[400px] md:w-[400px]",
                        className, "rounded-t-none border-t-0")}>
                    {buttons[editState.activePanelIndex].panelContent}
                </div>
            )}
            {editState.activePanelIndex != null && buttons[editState.activePanelIndex].nestedButtons && (
                <div
                    className={
                        cn("flex flex-col items-center absolute z-30", className, "rounded-t-none border-t-0 w-10"
                            // "flex flex-col items-center absolute w-10 top-[100%] mt-0 z-30",
                            // "bg-white dark:bg-zinc-900 border border-gray-400 dark:border-gray-600 rounded-t-none",
                            // className
                        )}
                    style={{
                        left: (buttonRefs.current[editState.activePanelIndex]?.offsetLeft || 0) + 1,
                    }}>
                    {buttons[editState.activePanelIndex].nestedButtons?.map((nestedButton, nestedIndex) => (
                        <Button key={`nested-button-${nestedIndex}`} onClick={nestedButton.onClick}
                                className="justify-center items-center h-10 w-10 p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                            {nestedButton.icon}
                        </Button>
                    ))}
                </div>
            )}
        </>
    );
};


export const EditNav = React.memo(_EditNav);