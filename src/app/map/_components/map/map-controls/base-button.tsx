import React, {ReactNode} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";


const BaseButton = ({onClick, className, children, disabled, ...props}: {
    onClick: () => void,
    className?: string,
    children: ReactNode,
    disabled?: boolean,
    props?: any
}) => {
    return (
        // <div className={cn("flex items-center justify-center", className)}>

        <Button
            disabled={disabled}
            onClick={onClick}
            className={cn("justify-center h-10 w-10 bg-white p-2 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 border-1 shadow-sm rounded-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                className
            )}
            {...props}
            // className={cn(
            //     "bg-white relative dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 border-1 shadow-sm rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-zinc-800 focus:ring-zinc-500 dark:focus:ring-zinc-500",
            //     className
            // )}
        >
            {children}
        </Button>
        // </div>
    );
};

export default BaseButton;