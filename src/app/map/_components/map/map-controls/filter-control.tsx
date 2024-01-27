"use client";

import * as React from "react";
import {CheckIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils"; // Make sure this utility function is defined or imported from a library
import {Button} from "@/components/ui/button";
import {Command, CommandItem, CommandGroup} from "@/components/ui/command";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";
import BaseButton from "@/app/map/_components/map/map-controls/base-button";
// import {BuoyStatus} from "@prisma/client";
import {FilterIcon} from "lucide-react";


// "use client"
//
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label";
import {useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Enums} from "@/types/supabase";
//
// export function CheckboxDemo() {
//     return (
//         <div className="flex items-center space-x-2">
//             <Checkbox id="terms" />
//             <label
//                 htmlFor="terms"
//                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//             >
//                 Accept terms and conditions
//             </label>
//         </div>
//     )
// }


const FilterControl = ({className, onDataFiltered, open, setOpen}: {
    className?: string,
    onDataFiltered: (selectedFilters: Set< Enums<'buoy_status'>>) => void,
    open: boolean,
    setOpen: (open: boolean) => void
}) => {

    const [selectedFilters, setSelectedFilters] = useState(new Set< Enums<'buoy_status'>>([]));
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleSelectFilter = (filter: Enums<'buoy_status'>) => {
        const newSelectedFilters = new Set(selectedFilters);

        if (newSelectedFilters.has(filter)) {
            newSelectedFilters.delete(filter);
        } else {
            newSelectedFilters.add(filter);
        }

        setSelectedFilters(newSelectedFilters);
        onDataFiltered(newSelectedFilters);  // This might be updating parent state or context

        // Update search parameters
        const newStatusParam = Array.from(newSelectedFilters).map(f => `neq.${f}`).join(',');
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('status', newStatusParam);
        router.replace(`${pathname}?${newSearchParams.toString()}`);
    };

    const filters = ["UNKNOWN", "ATTENTION", "OK", "PROPOSED"]


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    className={cn("h-10 w-10 bg-white p-2 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 border-1 shadow-sm rounded-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-zinc-700", className)}>
                    <FilterIcon className="w-6 h-6"/>
                </Button>
            </PopoverTrigger>
            {/*<PopoverContent className={cn("w-[200px] p-0", className, "mt-0")}>*/}
            {/*    {*/}
            {/*        filters.map((filter) => (*/}
            {/*            <div key={filter} className="flex items-center space-x-2 p-2">*/}
            {/*                <Checkbox id={filter}*/}
            {/*                          checked={!searchParams.get('status')?.includes(filter)}*/}
            {/*                          onCheckedChange={() => handleSelectFilter(filter)}/>*/}
            {/*                <Label htmlFor={filter}>{filter}</Label>*/}
            {/*            </div>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</PopoverContent>*/}
        </Popover>
    );
};

export default FilterControl;
