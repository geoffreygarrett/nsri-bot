"use client";

import * as React from "react";
import {CheckIcon, CaretSortIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils"; // Assuming cn is for classnames
import {Button} from "@/components/ui/button";
import {Command, CommandItem, CommandGroup, CommandInput, CommandEmpty} from "@/components/ui/command";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";
import {useMap} from "@vis.gl/react-google-maps";
import {Square3Stack3DIcon} from "@heroicons/react/24/outline";
import BaseButton from "@/app/map/_components/map/map-controls/base-button";
const MapTypeId = {
    HYBRID: 'hybrid',
    ROADMAP: 'roadmap',
    SATELLITE: 'satellite',
    TERRAIN: 'terrain'
};


const mapTypes = [
    {value: MapTypeId.HYBRID, label: "Hybrid"},
    {value: MapTypeId.ROADMAP, label: "Roadmap"},
    {value: MapTypeId.SATELLITE, label: "Satellite"},
    {value: MapTypeId.TERRAIN, label: "Terrain"}
];

export default function LayerCombobox({className}: { className?: string }) {
    const [open, setOpen] = React.useState(false);
    const map = useMap();
    const [mapTypeId, setMapTypeId] = React.useState(map?.getMapTypeId() || MapTypeId.ROADMAP);

    const handleSelectMapType = (typeId: string) => {
        setMapTypeId(typeId);
        if (map) {
            map.setMapTypeId(typeId);
        }
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    // onClick={() => setOpen(!open)}
                    className={cn("justify-center h-10 w-10 bg-white p-2 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 border-1 shadow-sm rounded-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                        className
                    )}
                >
                    <Square3Stack3DIcon className="h-6 w-6"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-[200px] p-0", className, "mt-0")}>
                <Command>
                    {/*<CommandInput placeholder="Search map type..." className="h-9"/>*/}
                    {/*<CommandEmpty>No map type found.</CommandEmpty>*/}
                    <CommandGroup>
                        {mapTypes.map((type) => (
                            <CommandItem
                                key={type.value}
                                value={type.value}
                                onSelect={() => handleSelectMapType(type.value)}
                            >
                                {type.label}
                                <CheckIcon
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        mapTypeId === type.value ? "opacity-100" : "opacity-0",
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

