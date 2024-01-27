"use client";

import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar"
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {getBaseUrl} from "@/code/domain";
import {cn} from "@/lib/utils";
import * as turf from '@turf/turf'


import {mkConfig, generateCsv, download} from "export-to-csv";
import React, {useCallback, useContext} from "react";
import {AppContext, isRescueBuoy} from "@/app/map/map";
import {Database, Tables} from "@/types/supabase";
import {KmlBuilder, triggerDownload} from "@/lib/export";
import {TABLE_STATE_STORAGE_KEY} from "@/store/table-reducer";
import {Point} from "geojson";


// mkConfig merges your options with the defaults
// and returns WithDefaults<ConfigOptions>
// const csvConfig =
//
// const mockData = [
//     {
//         name: "Rouky",
//         date: "2023-09-01",
//         percentage: 0.4,
//         quoted: '"Pickles"',
//     },
//     {
//         name: "Keiko",
//         date: "2023-09-01",
//         percentage: 0.9,
//         quoted: '"Cactus"',
//     },
// ];


export function MapMenubar({className, exportKml, exportCsv, sync}: {
    className?: string
    sync?: () => void
    exportKml?: () => void
    exportCsv?: () => void
}) {


    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentUrl = `${getBaseUrl()}${pathname}${searchParams.toString()}`
    const {state, dispatch} = useContext(AppContext);

    // Handlers for different sharing services
    const shareViaEmail = () => {
        const subject = encodeURIComponent("Check this out!");
        const body = encodeURIComponent("I found this interesting: ") + currentUrl;
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareViaWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${currentUrl}`, '_blank');
    };

    const printMap = () => {
        // Prepare the map component for printing if necessary
        // This might involve resizing, removing unnecessary controls, etc.

        // Trigger the print dialog
        window.print();
    };


    type FlattenedLocation<T> = T extends { location: Point }
        ? Omit<T, 'location'> & { lat: number; lng: number; alt: number }
        : T;

    const handleExportCsv = <K extends 'rescue_buoys' | 'nsri_stations'>(table: K) => {
        const csvConfig = mkConfig({
            filename: `${table}-${new Date().toISOString()}.csv`,
            useKeysAsHeaders: true,
            useBom: true,
            quoteStrings: true,
            fieldSeparator: ',',
            showTitle: false,
        })
        // flatten location field into lat, lng, alt
        const exportData = state.tables[table].values.map((row) => {
            const {location, ...otherProperties} = row;
            return {
                ...otherProperties,
                lat: location.coordinates[1],
                lng: location.coordinates[0],
                alt: location.coordinates[2]
            }
        }, {})
        const csv = generateCsv(csvConfig)(exportData as FlattenedLocation<Tables<K>>[]);
        download(csvConfig)(csv);
    }

    const handleExportJson = <K extends 'rescue_buoys' | 'nsri_stations'>(table: K) => {
        const json = JSON.stringify(state.tables[table].values, null, 2)
        triggerDownload(json, `${table}-${new Date().toISOString()}.json`, 'application/json')
    }

    const handleExportGeoJson = <K extends 'rescue_buoys' | 'nsri_stations'>(table: K) => {
        const points = state.tables[table].values.map((row) => {
            // Destructure to separate lat, lng, and alt, and capture the rest of the properties
            const {location, ...otherProperties} = row;
            return turf.point(location.coordinates, otherProperties);
        });
        const json = JSON.stringify(points, null, 2)
        triggerDownload(json, `${table}-${new Date().toISOString()}.geojson`, 'application/geo+json')
    }
    const handleExportKml = <K extends 'rescue_buoys' | 'nsri_stations'>(table: K) => {
        // Create top-level folders
        const builder = new KmlBuilder(table);
        builder
            .addStyle('nsri_prb_ok_pin', 'https://maps.google.com/mapfiles/kml/paddle/pink-blank.png')
            .addStyle('nsri_station_pin', 'https://maps.google.com/mapfiles/kml/pal3/icon23.png');

        // otherproperties stringified to Record<string, string>
        state.tables[table].values.forEach((row) => {
            const {location, ...otherProperties} = row;
            let extendedData: Record<string, string> = {}
            for (const [key, value] of Object.entries(otherProperties)) {
                if (typeof value === 'object') {
                    extendedData[key] = JSON.stringify(value)
                }
            }
            if (isRescueBuoy(row)) {
                builder.addPlacemark(row.name, "",
                    location.coordinates[0],
                    location.coordinates[1],
                    location.coordinates[2],
                    'nsri_prb_ok_pin',
                    extendedData);
            } else {
                builder.addPlacemark(row.name, "",
                    location.coordinates[0],
                    location.coordinates[1],
                    location.coordinates[2],
                    'nsri_station_pin',
                    extendedData);
            }
        });
        const kml = builder.build();
        triggerDownload(kml, `${table}-${new Date().toISOString()}.kml`, 'application/vnd.google-earth.kml+xml');
    }

    const ExportMenu = ({table}: { table: 'rescue_buoys' | 'nsri_stations' }) => {
        return (
            <MenubarSubContent>
                <MenubarItem onClick={() => handleExportCsv(table)}>CSV</MenubarItem>
                <MenubarItem onClick={() => handleExportJson(table)}>JSON</MenubarItem>
                <MenubarItem onClick={() => handleExportGeoJson(table)}>GeoJSON</MenubarItem>
                <MenubarItem onClick={() => handleExportKml(table)}>KML</MenubarItem>
            </MenubarSubContent>
        )
    }


    const handleDeleteCache = useCallback(() => {
        localStorage.removeItem(TABLE_STATE_STORAGE_KEY);
        router.refresh()
    }, []);



    const EditMenu = () => {


        //


        return (
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator/>
                    <MenubarCheckboxItem>Edit Mode<MenubarShortcut>⌘E</MenubarShortcut>
                    </MenubarCheckboxItem>
                    <MenubarSeparator/>
                    <MenubarItem
                        onClick={handleDeleteCache}
                        className="text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white rounded-sm"
                        >Delete Cache</MenubarItem>
                    {/*<MenubarItem>Cut</MenubarItem>*/}
                    {/*<MenubarItem>Copy</MenubarItem>*/}
                    {/*<MenubarItem>Paste</MenubarItem>*/}
                </MenubarContent>
            </MenubarMenu>
        )
    }


    return (
        <Menubar className={cn("print:invisible", className)}>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent className="print:hidden">
                    <MenubarItem disabled>
                        New Buoy <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={sync ? sync : () => {
                    }} disabled={!sync}>
                        Save Changes
                    </MenubarItem>
                    <MenubarSeparator/>
                    <MenubarSub>
                        <MenubarSubTrigger>Share</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem onClick={shareViaEmail}>Email link</MenubarItem>
                            <MenubarItem onClick={shareViaWhatsApp}>WhatsApp</MenubarItem>
                            {/* Add more MenubarItems for other services */}
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                        <MenubarSubTrigger>Export</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarSub>
                                <MenubarSubTrigger>Rescue Buoys</MenubarSubTrigger>
                                <ExportMenu table={'rescue_buoys'}></ExportMenu>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger>NSRI Stations</MenubarSubTrigger>
                                <ExportMenu table={'nsri_stations'}></ExportMenu>
                            </MenubarSub>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                        <MenubarSubTrigger>Import</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem disabled onClick={exportKml}>KML</MenubarItem>
                            <MenubarItem disabled onClick={exportCsv}>CSV</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator/>
                    <MenubarItem onClick={printMap}>
                        Print... <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
           <EditMenu/>
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
                    <MenubarCheckboxItem checked>
                        Always Show Full URLs
                    </MenubarCheckboxItem>
                    <MenubarSeparator/>
                    <MenubarItem inset>
                        Reload <MenubarShortcut>⌘R</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled inset>
                        Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem inset>Toggle Fullscreen</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem inset>Hide Sidebar</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            {/*<MenubarMenu>*/}
            {/*    <MenubarTrigger>Profiles</MenubarTrigger>*/}
            {/*    <MenubarContent>*/}
            {/*        <MenubarRadioGroup value="benoit">*/}
            {/*            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>*/}
            {/*            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>*/}
            {/*            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>*/}
            {/*        </MenubarRadioGroup>*/}
            {/*        <MenubarSeparator/>*/}
            {/*        <MenubarItem inset>Edit...</MenubarItem>*/}
            {/*        <MenubarSeparator/>*/}
            {/*        <MenubarItem inset>Add Profile...</MenubarItem>*/}
            {/*    </MenubarContent>*/}
            {/*</MenubarMenu>*/}
        </Menubar>
    )
}
