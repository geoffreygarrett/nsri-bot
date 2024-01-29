import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {MapPinIcon} from "@heroicons/react/24/outline";
import {useContext, useEffect, useState} from "react";
import {copyToClipboard, formatDD, formatDMM, formatDMS} from "@/lib/utils";
import {getPermissions, useAuthorizedCallback} from "@/app/map/map";
import {AppContext} from "@/app/app";
import {insertItemAction, SOURCE} from "@/store/table-reducer";
import * as turf from '@turf/turf'

interface ContextState {
    x: number
    y: number
    visible: boolean
}

import {v4 as uuidv4} from 'uuid';
import {Enums, Tables} from "@/types/supabase";
import {booleanPointInPolygon} from "@/lib/turf";


interface Coordinates {
    lat: number;
    lng: number;
}

export function MapContextMenu({triggerRef, ...props}: {
    className?: string,
    contextState?: ContextState
    triggerRef: React.MutableRefObject<HTMLDivElement | null>
}) {
    const {state, dispatch} = useContext(AppContext);
    const [coordinates, setCoordinates] = useState<Coordinates>({lat: 0, lng: 0});


    const findStationIdForBuoy = (coordinates: Coordinates, stations: Tables<'nsri_stations'>[]) => {
        const point = turf.point([coordinates.lng, coordinates.lat]);

        const stationsWithDistance = stations.map(station => {
            // Check and close the polygon loop if necessary
            const serviceAreaCoords =
                station.service_area && station.service_area.coordinates.length > 0
                    ? station.service_area.coordinates[0]
                    : [];

            // Close the polygon loop if necessary
            if (serviceAreaCoords.length > 0 &&
                serviceAreaCoords[0].toString() !== serviceAreaCoords[serviceAreaCoords.length - 1].toString()) {
                serviceAreaCoords.push(serviceAreaCoords[0]);
            }

            // Calculate distance for each station and check if it's in its service area
            return {
                ...station,
                distance: turf.distance(point, turf.point(station.location.coordinates)),
                isInServiceArea: station.service_area
                    ? booleanPointInPolygon(point, turf.polygon([serviceAreaCoords]))
                    : false
            };
        });

        // Filter stations in service area, sort by distance, and pick the closest
        const closestInServiceArea = stationsWithDistance
            .filter(station => station.isInServiceArea)
            .sort((a, b) => a.distance - b.distance)[0];

        // If no stations in service area, find the closest station overall
        return closestInServiceArea ? closestInServiceArea.id :
            stationsWithDistance.sort((a, b) => a.distance - b.distance)[0].id;
    };

    const handleNewRescueBuoy = () => {
        const stationId = findStationIdForBuoy(coordinates, state.tables.nsri_stations.values);
        dispatch(insertItemAction('rescue_buoys', {
            id: uuidv4(),
            name: 'New Rescue Buoy',
            description: '',
            location: {
                type: 'Point',
                coordinates: [coordinates.lng, coordinates.lat, 0]
            },
            station_id: stationId, // number | null
            status: "PROPOSED" as Enums<'buoy_status'>,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            buoy_id: null, // number | null
            deleted_at: null, // string (date) | null
            image_url: null, // string | null
            old_id: null,
            metadata: {},
        }, SOURCE.CLIENT))
    }

    useEffect(() => {
        triggerRef.current?.addEventListener('mapcontextmenu', (e: any) => {
            setCoordinates({lat: e.detail.lat, lng: e.detail.lng})
            triggerRef.current?.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.detail.clientX,
                    clientY: e.detail.clientY,
                })
            );
            e.preventDefault();
        });
    }, [triggerRef])

    const CopyCoordinatesMenu = ({coordinates}: { coordinates: Coordinates }) => (
        <ContextMenuSub>
            <ContextMenuSubTrigger inset>Copy</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
                <ContextMenuItem onClick={() => copyToClipboard(formatDD(coordinates.lat, coordinates.lng))}>
                    Decimal Degrees (DD)
                </ContextMenuItem>
                <ContextMenuItem onClick={() => copyToClipboard(formatDMS(coordinates.lat, coordinates.lng))}>
                    Degrees, Minutes, and Seconds (DMS)
                </ContextMenuItem>
                <ContextMenuItem onClick={() => copyToClipboard(formatDMM(coordinates.lat, coordinates.lng))}>
                    Degrees and Decimal Minutes (DMM)
                </ContextMenuItem>
            </ContextMenuSubContent>
        </ContextMenuSub>
    );


    return (
        <ContextMenu>
            <ContextMenuTrigger
                ref={triggerRef}
                className="focus:outline-none"
                onContextMenu={(e: any) => {
                    e.detail ? setCoordinates({lat: e.latLng.lat(), lng: e.latLng.lng()}) : null
                }}/>
            <ContextMenuContent
                className="w-64 block justify-center bg-white p-2 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-900 border-1 shadow-sm rounded-sm text-sm font-medium text-gray-700 dark:text-gray-200">
                <ContextMenuLabel>
                    <div className="flex items-center"> {/* Use flexbox for alignment */}
                        <MapPinIcon className="h-4 w-4 mr-2"/>
                        <span
                            className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatDMS(coordinates.lat, coordinates.lng)}</span>
                    </div>
                </ContextMenuLabel>
                <ContextMenuSeparator/>
                <CopyCoordinatesMenu coordinates={coordinates}/>
                <ContextMenuItem inset onClick={handleNewRescueBuoy}>
                    New Rescue Buoy
                </ContextMenuItem>

                {/*    <ContextMenuItem inset>*/}
                {/*        Back*/}
                {/*        <ContextMenuShortcut>⌘[</ContextMenuShortcut>*/}
                {/*    </ContextMenuItem>*/}
                {/*    <ContextMenuItem inset disabled>*/}
                {/*        Forward*/}
                {/*        <ContextMenuShortcut>⌘]</ContextMenuShortcut>*/}
                {/*    </ContextMenuItem>*/}
                {/*    <ContextMenuItem inset>*/}
                {/*        Reload*/}
                {/*        <ContextMenuShortcut>⌘R</ContextMenuShortcut>*/}
                {/*    </ContextMenuItem>*/}
                {/*    <ContextMenuSub>*/}
                {/*        <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>*/}
                {/*        <ContextMenuSubContent className="w-48">*/}
                {/*            <ContextMenuItem>*/}
                {/*                Save Page As...*/}
                {/*                <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>*/}
                {/*            </ContextMenuItem>*/}
                {/*            <ContextMenuItem>Create Shortcut...</ContextMenuItem>*/}
                {/*            <ContextMenuItem>Name Window...</ContextMenuItem>*/}
                {/*            <ContextMenuSeparator/>*/}
                {/*            <ContextMenuItem>Developer Tools</ContextMenuItem>*/}
                {/*        </ContextMenuSubContent>*/}
                {/*    </ContextMenuSub>*/}
                {/*    <ContextMenuSeparator/>*/}
                {/*    <ContextMenuCheckboxItem checked>*/}
                {/*        Show Bookmarks Bar*/}
                {/*        <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>*/}
                {/*    </ContextMenuCheckboxItem>*/}
                {/*    <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>*/}
                {/*    <ContextMenuSeparator/>*/}
                {/*    <ContextMenuRadioGroup value="pedro">*/}
                {/*        <ContextMenuLabel inset>People</ContextMenuLabel>*/}
                {/*        <ContextMenuSeparator/>*/}
                {/*        <ContextMenuRadioItem value="pedro">*/}
                {/*            Pedro Duarte*/}
                {/*        </ContextMenuRadioItem>*/}
                {/*        <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>*/}
                {/*    </ContextMenuRadioGroup>*/}
            </ContextMenuContent>
        </ContextMenu>
    )
}

