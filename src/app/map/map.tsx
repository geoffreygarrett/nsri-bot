"use client";

import {EquipmentStatus, IExport, IMarker, DataType} from "@/components/types";
import supabase, {Enums} from "@/supabase";
import Image from 'next/image';
import {exportCsv, exportKml} from "@/lib/export";
import Markers from "@/components/map-features/map-markers";
import useGeolocationPosition from "@/hooks/use_user_location";
import MarkerClusterer from "@/app/map/_components/integrations/google-maps/marker-clusterer";
import {v4 as uuidv4} from 'uuid';
import {Polygon as PolygonType} from "geojson";
import {glassEffect, noGlassEffect} from "@/constants";

import {
    ArrowsPointingOutIcon,
    Square3Stack3DIcon,
    ArrowsPointingInIcon,
    MinusIcon,
    PlusIcon, UserCircleIcon, Cog6ToothIcon, XMarkIcon, PencilIcon, LockOpenIcon, LockClosedIcon, TrashIcon
} from "@heroicons/react/24/outline";

import {
    ExclamationCircleIcon,
    PencilSquareIcon
} from "@heroicons/react/24/solid";
import * as turf from '@turf/turf'


const DARK_RASTER_MAP_ID = 'ca29dbf0633b6ee9'
const DARK_VECTOR_MAP_ID = '6b52a341154682a5'
const LIGHT_RASTER_MAP_ID = 'a6ef439e871dcbb2'
const LIGHT_VECTOR_MAP_ID = '192722c95c08b0b5'

import React, {
    createContext,
    Fragment,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState
} from "react";
import {
    // AdvancedMarker,
    APIProvider,
    // Map,
    ControlPosition,
    // Pin,
    useMap,
    MapControl, Marker, useApiIsLoaded, useMapsLibrary
} from '@vis.gl/react-google-maps';
import FullScreenToggle from "./_components/map/map-controls/fullscreen-toggle";
import Pin from "@/app/map/_components/integrations/google-maps/draw/pin";
import {
    AdvancedMarker,
    AdvancedMarkerRef,
    useAdvancedMarkerRef
} from "@/app/map/_components/integrations/google-maps/draw/advanced-marker";
import {
    useInfoWindowControlContext,
    useInfoWindowStateContext
} from "@/app/map/_components/integrations/google-maps/draw/info-window/info-window-context";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

import MapUserLocation from "@/app/map/_components/map/map-user-location";

import {Tables, TablesInsert, TablesUpdate} from "@/types/supabase";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import LayerCombobox from "./_components/map/map-controls/layer-combobox";
import ZoomControls from "./_components/map/map-controls/zoom-controls";
import {FilterIcon, LifeBuoyIcon} from "lucide-react";
import UserLocation from "./_components/map/map-controls/user-location";
import SettingsControl from "./_components/map/map-controls/settings-control";


import {Database} from "@/types/supabase";


export function isRescueBuoy(point: any): point is Tables<'rescue_buoys'> {
    // console.log(point);
    return point && typeof point === 'object' && 'buoy_id' in point && 'station_id' in point;
}

export function isStation(point: any): point is Tables<'nsri_stations'> {
    return point && typeof point === 'object' && 'service_area' in point && 'name' in point;
}


// Define your action types
const actionTypes = {
    SET_MARKERS: 'SET_MARKERS',
    SET_QUALITY: 'SET_QUALITY',
    TOGGLE_SHOW_BUOYS: 'TOGGLE_SHOW_BUOYS',
    TOGGLE_SHOW_STATIONS: 'TOGGLE_SHOW_STATIONS',
    TOGGLE_SHOW_USER_LOCATION: 'TOGGLE_SHOW_USER_LOCATION',
    TOGGLE_ENABLE_CLUSTERING: 'TOGGLE_ENABLE_CLUSTERING',


    TOGGLE_SETTING: 'TOGGLE_SETTING',
    SET_LOADING: 'SET_LOADING',
    SET_REALTIME_STATE: 'SET_REALTIME_STATE',
    SET_REALTIME_LOADING: 'SET_REALTIME_LOADING',
    SET_LOCATION: 'SET_LOCATION',
    SET_INFO_WINDOW: 'SET_INFO_WINDOW',

    NEW_POSITION_LINE: 'NEW_POSITION_LINE',

    // ... other actions like handling geolocation changes
};

interface Toggle {
    enabled: boolean;
    loading: boolean;
}


// MapMarker[],
type State = {
    info_window: {
        id: string | number | null,
        marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null,
        open: boolean
        item: Tables<'rescue_buoys'> | Tables<'nsri_stations'> | null
        draggable: boolean
    }
    location: {
        value: GeolocationPosition | null,
        loading: boolean,
        error: GeolocationPositionError | null
    },
    settings: {
        location: { enableHighAccuracy: boolean, watchPosition: boolean, timeout: number },
        map: { center: { lat: number, lng: number }, zoom: number },
        clusterer: { algorithmOptions?: AlgorithmOptions, algorithm?: Algorithm },
        toggles: {
            show_buoys: Toggle,
            show_stations: Toggle,
            enable_location: Toggle,
            enable_clustering: Toggle,
            enable_performance_mode: Toggle,
        }
    },
}

interface ToggleSettingAction {
    type: typeof actionTypes.TOGGLE_SETTING;
    payload: keyof State['settings']['toggles'];
}

interface SetLoadingAction {
    type: typeof actionTypes.SET_LOADING;
    payload: {
        key: keyof State['settings']['toggles'];
        loading: boolean;
    };
}

interface SetLocationAction {
    type: typeof actionTypes.SET_LOCATION;
    payload: State['location'];
}

interface SetInfoWindowAction {
    type: typeof actionTypes.SET_INFO_WINDOW;
    payload: Partial<State['info_window']>;
}

interface SetQualityAction {
    type: typeof actionTypes.SET_QUALITY;
    payload: Record<string, any>;
}

type Action =
    | ToggleSettingAction
    | SetLoadingAction
    | SetLocationAction;

const RESCUE_BUOYS = 'rescue_buoys';
const NSRI_STATIONS = 'nsri_stations';


// Create the reducer function
const reducer = (state: State, action: Action): State => {
    switch (action.type) {


        // case actionTypes.SET_QUALITY:
        //     const setQualityAction = action as SetQualityAction;
        //     return {...state, quality: setQualityAction.payload};

        case actionTypes.SET_INFO_WINDOW:
            const setInfoWindowAction = action as SetInfoWindowAction;
            // console.log(setInfoWindowAction.payload)
            return {
                ...state,
                info_window: {
                    ...state.info_window,
                    ...setInfoWindowAction.payload
                }
            };

        case actionTypes.TOGGLE_SETTING:
            // Ensure that action is of ToggleSettingAction type
            const toggleAction = action as ToggleSettingAction;

            // Toggle setting and set loading to true initially
            return {
                ...state,
                settings: {
                    ...state.settings,
                    toggles: {
                        ...state.settings.toggles,
                        [toggleAction.payload]: {
                            ...state.settings.toggles[toggleAction.payload],
                            enabled: !state.settings.toggles[toggleAction.payload].enabled,
                            loading: true
                        }
                    }
                }
            };

        case actionTypes.SET_LOADING:
            // Ensure that action is of SetLoadingAction type
            const setLoadingAction = action as SetLoadingAction;

            // Set loading state for a specific setting
            return {
                ...state,
                settings: {
                    ...state.settings,
                    toggles: {
                        ...state.settings.toggles,
                        [setLoadingAction.payload.key]: {
                            ...state.settings.toggles[setLoadingAction.payload.key],
                            loading: setLoadingAction.payload.loading
                        }
                    }
                }
            };


        case actionTypes.SET_LOCATION:
            // Ensure that action is of SetLocationAction type
            const setLocationAction = action as SetLocationAction;

            // Set location state
            return {...state, location: {...state.location, ...setLocationAction.payload}};

        default:
            return state;
    }
};


// export const useLocation = (enableHighAccuracy = false, watchPosition = false, timeout = 10000, enabled = false) => {
const initialState: State = {
    info_window: {
        id: null,
        marker: null,
        open: false,
        item: null,
        draggable: false
    },
    location: {
        value: null,
        loading: false,
        error: null
    },
    settings: {
        location: {enableHighAccuracy: false, watchPosition: false, timeout: 10000},
        map: {center: {lat: -34.12517, lng: 19.0376486}, zoom: 5},
        clusterer: {algorithmOptions: {maxZoom: 15}},
        toggles: {
            show_buoys: {enabled: true, loading: false},
            show_stations: {enabled: false, loading: false},
            enable_location: {enabled: false, loading: false},
            enable_clustering: {enabled: false, loading: false},
            enable_performance_mode: {enabled: false, loading: false}
        }
    }
};

export const AppContext = createContext<{
    state: (TableState<'rescue_buoys'> & TableState<'nsri_stations'> & State);
    dispatch: React.Dispatch<TableActions<'rescue_buoys'> | TableActions<'nsri_stations'> | Action>
}>({
    state: combineState(createInitialState('rescue_buoys'), createInitialState('nsri_stations'), initialState),
    dispatch: () => null
});


import tableReducer, {
    applyFilters, Change,
    combineDispatch,
    combineState, createFilter, createInitialState, deleteItemAction,
    setItemsAction, SOURCE, TABLE_STATE_STORAGE_KEY,
    TableAction, TableActions,
    TableState, updateChangeStatusAction, updateItemAction,
    useRealtimeChanges,
} from "@/store/table-reducer";


// Define a function to set up real-time updates
export const AppProvider = ({children}: { children: React.ReactNode }) => {
    "use client";
    const [localTables, setLocalTables] = useLocalStorage(TABLE_STATE_STORAGE_KEY, null);
    // const localStorageChanges = localStorage.getItem(TABLE_STATE_STORAGE_KEY);

    // Safely parse the local storage data
    const getInitialState = () => {
        if (localTables && localTables !== "undefined") {
            try {
                return {tables: localTables}
            } catch (error) {
                console.error('Error parsing local storage data:', error);
            }
        }
        // Default initial state if local storage is empty, undefined, or in case of error
        return {
            tables: {
                rescue_buoys: {
                    values: [], changes: [], realtime: {enabled: true}, filters: [
                        createFilter('rescue_buoys')('status', 'neq', 'UNKNOWN')
                    ]
                },
                nsri_stations: {
                    values: [], changes: [], realtime: {enabled: true}
                }
            }
        };
    };

    // Define your reducer function
    // const supabase = useSupabaseClient<Database>();
    const [mapState, mapDispatch] = useReducer(reducer, initialState);
    const [tableState, tableDispatch] = useReducer(
        tableReducer<'rescue_buoys' & 'nsri_stations'>, getInitialState()
    );

    const state = useMemo(() => combineState(mapState, tableState), [mapState, tableState]);
    const dispatch = useCallback(combineDispatch(mapDispatch, tableDispatch), [mapDispatch, tableDispatch]);

    // After reducer logic, save the changes to local storage
    useEffect(() => {
        // localStorage.setItem(TABLE_STATE_STORAGE_KEY, JSON.stringify(state.tables));
        setLocalTables(state.tables);
    }, [setLocalTables, state.tables]);


    // Use hook for location
    useLocation(
        {
            ...state.settings.location,
            enabled: state.settings.toggles.enable_location.enabled,
            onLocationChange: (position: GeolocationPosition) => {
                dispatch({type: actionTypes.SET_LOCATION, payload: {...state.location, value: position}});
            },
            onError: (error: GeolocationPositionError) => {
                dispatch({type: actionTypes.SET_LOCATION, payload: {...state.location, error: error}});
            },
            onLoadingChange: (loading: boolean) => {
                dispatch({type: actionTypes.SET_LOCATION, payload: {...state.location, loading: loading}});
            }
        }
    );

    useRealtimeChanges({
        supabase,
        table: 'rescue_buoys',
        enabled: true,
        dispatch,
        channelName: `custom-${RESCUE_BUOYS}-channel`,
        timeout: 10000,
    });

    useRealtimeChanges({
        supabase,
        table: 'nsri_stations',
        enabled: true,
        dispatch,
        channelName: `custom-${NSRI_STATIONS}-channel`,
        timeout: 10000,
    });

    return (
        <AppContext.Provider value={{state, dispatch}}>
            {children}
        </AppContext.Provider>
    );
};
import {useDebounce, useMediaQuery} from "@uidotdev/usehooks";
import {MapMenubar} from "./_components/map/map-controls/menubar";
import {useLocation} from "@/hooks/use-location";
import {BuoyInfoWindowContent, StationInfoWindowContent} from "./_components/map/buoy-info-window-content";
import {AlgorithmOptions, Algorithm} from "@googlemaps/markerclusterer";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Polygon} from "@/app/map/_components/integrations/google-maps/draw/polygon";


import {usePermission} from "react-permission-role";
import {ChangesDiffViewer} from "./_components/changes-diff-viewer";
import {Transition} from "@headlessui/react";
import {RescueBuoyForm} from "./_components/forms/rescue-buoy-form";
import {EditRescueBuoyForm} from "./_components/forms/rescue-buoy-edit-dialogue";


const _BuoyPinContent: React.FC<{ item: Tables<'rescue_buoys'>, data?: Record<string, any> }> = ({item, data}) => {
    const {draggable, synchronized, selected} = data || {};
    return (
        <AdvancedPin draggable={draggable} synchronized={synchronized} selected={selected}>
            <span>{item.buoy_id ? item.buoy_id.toString().replace(/^0+/, "") : "?"}</span>
        </AdvancedPin>
    )
}

const BuoyPinContent = React.memo(_BuoyPinContent);

const _StationPinContent: React.FC<{ item: Tables<'nsri_stations'>, data?: Record<string, any> }> = ({item, data}) => {
    const {draggable, synchronized, selected} = data || {};
    return (
        <AdvancedPin draggable={draggable} synchronized={synchronized} selected={selected}>
            <span>{item.id ? item.id.toString().replace(/^0+/, "") : "?"}</span>
        </AdvancedPin>
    )
}

const StationPinContent = React.memo(_StationPinContent);


import {useBeforeunload} from 'react-beforeunload';
import {AdvancedPin} from "./_components/map/map-features/advanced-pin";
import {MapSettingsControl} from "./_components/map/map-controls/map-settings-control";
import {
    AdvancedMarkerWithHooksNsriStations,
    AdvancedMarkerWithHooksRescueBuoys
} from "./_components/map/map-features/advanced-marker-hooks";
import {EditNav, EditNavButton, EditState} from "./_components/map/map-controls/edit-nav";
import {PolygonWithHooks} from "./_components/map/map-features/polygon-hooks";

import {InvitationFormValues} from "@/app/(dash)/invite/_components/invitation-form";
import {useConfirm} from "@/providers/confirmation-provider";
import {
    DrawingManagerComponent,
    DrawingMode
} from "@/app/map/_components/integrations/google-maps/draw/drawing-manager";
import {Card, CardContent} from "@/components/ui/card";
import {Form} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
// import {
//     LEVEL_OF_DETAIL,
//     QualityLevels,
//     useAdaptiveQuality,
//     useFPS,
//     useFps
// } from "@/app/_components/providers/fps-provider";
import {useFps} from "@/hooks/use-fps"
import {useLocalStorage} from "@uidotdev/usehooks";

// const useAuthorizedCallback = (callback: (...args: any[]) => void, requiredRoles: string[], permissions: string[]) => {
//     const {isAuthorized, isLoading} = usePermission();
//
//     const wrappedCallback = useCallback(async (...args: any[]) => {
//         if (isLoading) return;  // Optionally handle the loading state
//
//         const hasPermission = await isAuthorized(requiredRoles, permissions);
//         if (hasPermission) {
//             callback(...args);
//         } else {
//             toast.error('You are not authorized to perform this action');
//             // Handle unauthorized access if needed
//         }
//     }, [callback, requiredRoles, permissions, isLoading, isAuthorized]);
//
//     return wrappedCallback;
// };
// Adjust the signature of useAuthorizedCallback to accept a function for roles and permissions
export const useAuthorizedCallback = (
    callback: (...args: any[]) => void,
    getRolesAndPermissions: (...args: any[]) => { roles: string[], permissions: string[] }
) => {
    const {isAuthorized, isLoading} = usePermission();

    const wrappedCallback = useCallback(async (...args: any[]) => {
        if (isLoading) return;  // Optionally handle the loading state

        const {roles, permissions} = getRolesAndPermissions(...args);
        const hasPermission = await isAuthorized(roles, permissions);
        if (hasPermission) {
            callback(...args);
        } else {
            toast.error('You are not authorized to perform this action');
            // Handle unauthorized access if needed
        }
    }, [callback, getRolesAndPermissions, isLoading, isAuthorized]);

    return wrappedCallback;
};

export const getStationID = (item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
    if (isRescueBuoy(item)) {
        return item.station_id;
    } else if (isStation(item)) {
        return item.id;
    }
};

export const getPermissions = (action: 'edit' | 'create' | 'delete', item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
    const baseRole = isRescueBuoy(item) ? 'rescue_buoys' : isStation(item) ? 'nsri_stations' : null;
    const stationID = baseRole ? getStationID(item) : null;

    return baseRole ? {
        roles: ['super-admin', `station-admin:${stationID}`],
        permissions: [`${baseRole}:${action}:${stationID}`]
    } : {
        roles: [],
        permissions: []
    };
};


// Main map component
const SimpleMap = ({serverData}: {
    serverData: { rescue_buoys: Tables<'rescue_buoys'>[], nsri_stations: Tables<'nsri_stations'>[] }
}) => {
    // console.log('SimpleMap', serverData);
    const {
        state, dispatch
    } = useContext(AppContext);

    const getAggregatedChanges = useCallback(<T extends 'rescue_buoys' | 'nsri_stations'>(table: T) => {
        const aggregatedChanges: Record<string, Change<'rescue_buoys' | 'nsri_stations'>> = {};

        // Aggregate changes
        for (const change of state.tables[table].changes) {
            if (change.source === 'client' && !change.synchronized) {
                const existingChange = aggregatedChanges[change.id];
                if (!existingChange) {
                    aggregatedChanges[change.id] = change;
                } else {
                    if (existingChange.type === 'INSERT' && change.type === 'DELETE') {
                        delete aggregatedChanges[change.id];
                    } else if (change.type !== 'DELETE') {
                        // Keep the latest update or insert
                        aggregatedChanges[change.id] = {
                            ...change,
                            oldItem: existingChange.oldItem,
                            newItem: {...existingChange.newItem, ...change.newItem}
                        };
                    }
                }
            }
        }

        // Convert to array format if needed
        return aggregatedChanges;
    }, [state.tables]);


    const sync = useCallback(<T extends 'rescue_buoys' | 'nsri_stations'>() => {
        for (const table of ['rescue_buoys', 'nsri_stations'] as const) {

            const aggregatedChanges: Record<string, Change<'rescue_buoys' | 'nsri_stations'>> = getAggregatedChanges(table);
            console.log('aggregatedChanges', aggregatedChanges);

            // Group insert and update changes for batch processing
            const upserts = Object.values(aggregatedChanges).flat().filter(change =>
                change.type === 'INSERT' || change.type === 'UPDATE'
            ).map(change => change.newItem as Tables<'rescue_buoys'> | Tables<'nsri_stations'>);

            // Batch insert and update operations
            if (upserts.length > 0 && upserts) {
                console.log('Batch INSERT or UPDATE', upserts);
                console.log(upserts);
                supabase.from(table).upsert(upserts).then(({data, error}) => {
                    if (error) {
                        console.error(error);
                        toast.error(error.message);
                    } else {
                        upserts.forEach(item => {
                            dispatch(updateChangeStatusAction(table, item.id.toString(), true));
                        });
                        toast.success('Batch operation successful');
                    }
                });
            }

            // Process delete operations individually
            Object.values(aggregatedChanges).flat().forEach(change => {
                if (change.type === 'DELETE') {
                    console.log('DELETE', change);
                    supabase.from(table).delete().match({id: change.id}).then(({data, error}) => {
                        if (error) {
                            console.error(error);
                            toast.error(error.message);
                        } else {
                            dispatch(updateChangeStatusAction(table, change.id.toString(), true));
                            toast.success('Delete operation successful');
                        }
                    });
                }
            });


        }
    }, [getAggregatedChanges, dispatch]);

    const reconcileData = useCallback(<T extends { id: string | number; updated_at: string }>(
        serverData: T[],
        localData: T[]
    ) => {
        const localDataMap = new Map(localData.map(item => [item.id, item]));

        return serverData.map(serverItem => {
            const localItem = localDataMap.get(serverItem.id);
            if (localItem) {
                const localDate = new Date(localItem.updated_at);
                const serverDate = new Date(serverItem.updated_at);
                if (localDate > serverDate) {
                    return localItem;
                }
            }
            return serverItem;
        }).concat(
            localData.filter(localItem => !serverData.some(serverItem => serverItem.id === localItem.id))
        );
    }, []);

    useEffect(() => {
        const reconciledData = reconcileData(serverData.rescue_buoys, state.tables.rescue_buoys.values);
        dispatch(setItemsAction('rescue_buoys', reconciledData));
    }, [serverData.rescue_buoys, dispatch, reconcileData]);

    useEffect(() => {
        const reconciledData = reconcileData(serverData.nsri_stations, state.tables.nsri_stations.values);
        dispatch(setItemsAction('nsri_stations', reconciledData));
    }, [serverData.nsri_stations, dispatch, reconcileData]);


    useEffect(() => {
        console.log(state.tables.rescue_buoys.changes);
        console.log(state.tables.nsri_stations.changes);
    }, [state.tables.rescue_buoys.changes, state.tables.nsri_stations.changes]);


    type FirstKey<T> = Extract<keyof T, string>;

    const getFirstKeyAndValue = <T extends keyof Database['public']['Tables']>(item: Tables<T>): [keyof Tables<T>, Tables<T>[keyof Tables<T>]] => {
        const firstKey = Object.keys(item)[0] as FirstKey<Tables<T>>
        return [firstKey, item[firstKey]];
    };

    const onDragEndMarkerUpdate = useCallback(((
        e: google.maps.MapMouseEvent,
        table: 'nsri_stations' | 'rescue_buoys',
        item: Tables<'nsri_stations'> | Tables<'rescue_buoys'>
    ) => {
        const position = e.latLng?.toJSON();
        const [column, value] = getFirstKeyAndValue(item);
        if (position) {
            const updatePayload = {
                column: column,
                value: value,
                data: {
                    ...item,
                    location: {
                        'type': `Point` as const,
                        'coordinates': [position.lng, position.lat, item.location.coordinates[2]]
                    },
                    updated_at: new Date().toISOString()
                }
            };

            // Type assertion here
            dispatch(updateItemAction(table, updatePayload, 'client'));
        }
    }), [dispatch, getFirstKeyAndValue]);

    const {isAuthorized} = usePermission();


    const areAnyUnsynchronizedChanges = useCallback((table: 'nsri_stations' | 'rescue_buoys') => {
        return state.tables[table].changes.some(change => !change.synchronized);
    }, [state.tables]);

    const [aggregatedChanges, setAggregatedChanges] =
        useState<Record<string, Change<'rescue_buoys' | 'nsri_stations'>>>({});

    useEffect(() => {
        setAggregatedChanges(getAggregatedChanges('rescue_buoys'));
    }, [state.tables.rescue_buoys.changes, getAggregatedChanges]);

    const [isUnsynchronized, setIsUnsynchronized] = useState(false);
    useEffect(() => {
        setIsUnsynchronized(areAnyUnsynchronizedChanges('rescue_buoys') || areAnyUnsynchronizedChanges('nsri_stations'));
    }, [state.tables.rescue_buoys.changes, state.tables.nsri_stations.changes, areAnyUnsynchronizedChanges]);


    // const [editState, setEditState] = useState<'edit' | 'view'>('view');
    const [editState, setEditState] = useState<EditState>({
        focused: null,
        locked: false,
        mode: 'view',
        formOpen: false,
        typeSpecific: {},
        open: false
    });

    // useEffect(() => {
    //     const result = supabase.from('rescue_buoys').select('*').csv().then(({data, error}) => {
    //         if (error) {
    //             console.error(error);
    //         } else {
    //             console.log(data);
    //         }
    //     });
    // }, [supabase]);

    useEffect(() => {
        console.log('editState', editState);
        console.log('editState.focused?.id', editState.focused?.id);

    }, [editState]);


    const handleEditClick = useAuthorizedCallback(
        useCallback((item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
            setEditState((prevState: EditState) => ({
                ...prevState,
                mode: 'edit',
                open: true,
                locked: true,
                focused: item
            }));
        }, [setEditState]),
        (item) => (getPermissions('edit', item))
    );

    const handleDeletion = useAuthorizedCallback(
        useCallback((item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
            dispatch(deleteItemAction('rescue_buoys', {column: 'id', value: item.id}, SOURCE.CLIENT));
            setEditState(prevState => ({
                ...prevState,
                open: false
            }));
        }, [dispatch]),
        (item) => (getPermissions('delete', item))
    );

    const confirm = useConfirm();

    const handleDeleteClick = async (item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
        // Set up the payload and open the confirmation dialog
        confirm({
            title: 'Confirm deletion',
            description: `Do you really want to delete this ${isRescueBuoy(item) ? 'pink rescue buoy' : 'station'}?`,
            actions: [
                {label: 'Delete', onClick: () => handleDeletion(item), className: 'bg-red-500 text-white'},
            ],
        });
    };

    useEffect(() => {
        // if editState.focused is changed, update it,
        if (!editState.focused) return;
        const item = editState.focused;
        const {id} = item;
        state.tables.rescue_buoys.values.forEach((buoy) => {
            if (buoy.id === id) {
                setEditState(prevState => ({
                    ...prevState,
                    focused: buoy
                }));
            }
        });
        state.tables.nsri_stations.values.forEach((station) => {
            if (station.id === id) {
                setEditState(prevState => ({
                    ...prevState,
                    focused: station
                }));
            }
        });
    }, [editState.focused, state.tables.rescue_buoys.values, state.tables.nsri_stations.values]);

    const {closeInfoWindow} = useInfoWindowControlContext();


    // edit nav stuff
    const renderIcon = (item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
        return isRescueBuoy(item)
            ? <LifeBuoyIcon className="h-6 w-6 text-pink-500"/>
            : <Image src={'/nsri-logo.svg'} alt={'NSRI logo'} width={24} height={24}/>;
    };

    const renderName = (item: Tables<'rescue_buoys'> | Tables<'nsri_stations'>) => {
        // if (isRescueBuoy(item)) return item.name;
        if (isRescueBuoy(item)) return `Buoy ${item.station_id?.toString().replace(/^0+/, "")}-${item.buoy_id ? item.buoy_id.toString().replace(/^0+/, "") : "?"}`;
        if (isStation(item)) return `Station ${item.id.toString().replace(/^0+/, "")}`;
        return 'Unknown';
    };

    const buttonsConfig: (editState: EditState, setEditState: React.Dispatch<React.SetStateAction<EditState>>) => EditNavButton[] = (editState, setEditState) => [
        // Define your buttons here
        // Example:
        // {
        //     icon: <PencilIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
        //     onClick: () => setEditState(prevState => ({...prevState, formOpen: !prevState.formOpen})),
        //     condition: true
        // },
        // {
        //     icon: <PencilIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
        //     // onClick: () => setEditState(prevState => ({...prevState, formOpen: !prevState.formOpen})),
        //     panelContent: (
        //         <div className="flex flex-col space-y-2 p-2 w-full h-full sm:h-auto sm:bottom-0">
        //             <form>
        //                 <div className="flex flex-col space-y-2">
        //                     <Input name="name" type="text" placeholder="Name" className="h-8 w-full p-2 m-0"/>
        //                     <Input name="station_id" type="text" placeholder="Station ID"
        //                            className="h-8 w-full p-2 m-0"/>
        //                     <Input name="buoy_id" type="text" placeholder="Buoy ID" className="h-8 w-full p-2 m-0"/>
        //                     <Input name="status" type="text" placeholder="Status" className="h-8 w-full p-2 m-0"/>
        //                 </div>
        //             </form>
        //
        //             <div className="flex flex-row space-x-2">
        //                 <Button
        //                     onClick={() => setEditState(prevState => ({...prevState, formOpen: !prevState.formOpen}))}
        //                     className="text-sm py-1 px-2">
        //                     Edit
        //                 </Button>
        //                 <Button onClick={() => handleDeleteClick(editState.focused)} className="text-sm py-1 px-2">
        //                     Delete
        //                 </Button>
        //             </div>
        //         </div>
        //     ),
        //
        //     condition: true
        // },
        {
            icon: <PencilIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
            // onClick: () => setEditState(prevState => ({...prevState, formOpen: !prevState.formOpen})),
            panelContent: <RescueBuoyForm buoy={editState.focused as Tables<'rescue_buoys'>}
                                          className={cn("flex flex-col space-y-2 p-2 w-full h-screen sm:h-auto sm:bottom-0", glassEffect)}
                                          onClose={() => setEditState(prevState => ({
                                              ...prevState,
                                              formOpen: false
                                          }))}/>,
            condition: true,
        },
        {
            icon: editState.locked ?
                <LockClosedIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/> :
                <LockOpenIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
            onClick: () => setEditState(prevState => ({...prevState, locked: !prevState.locked})),
            condition: editState.focused !== null
        },
        {
            icon: <TrashIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
            onClick: () => {
                if (editState.focused) {
                    handleDeleteClick(editState.focused).then(() => {
                        // additional logic if needed
                    });
                }
            },
            condition: editState.focused !== null
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     strokeWidth="1.5" stroke="currentColor"
                     className="w-6 h-6 text-gray-600 dark:text-gray-200">
                    <polygon points="3,19 6,5 14,3 20,10 17,20 8,16"
                             strokeLinecap="round"
                             strokeLinejoin="round"/>
                </svg>
            ),
            condition: isStation(editState.focused),
            nestedButtons: [
                {
                    icon: <PlusIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
                    onClick: () => setEditState(prevState => ({...prevState, typeSpecific: {polygonCreate: true}})),
                    condition: true
                },
                {
                    icon: <TrashIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
                    onClick: () => console.log('trash'),
                    condition: true
                },
                {
                    icon: <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
                    onClick: () => setEditState(prevState => ({
                        ...prevState,
                        activePanelIndex: null,
                        typeSpecific: {polygonCreate: false}
                    })),
                    condition: true
                }
            ],
            onClick: () => setEditState(prevState => ({...prevState, typeSpecific: {polygonCreate: false}})),
        },
        {
            icon: <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-200"/>,
            onClick: () => setEditState(prevState => ({...prevState, open: false})),
            condition: true
        }
    ];

    const drawingLib = useMapsLibrary('drawing');

    // const handleStationPolygonInsertAt = useCallback((index: number, _: google.maps.LatLng, item: Tables<'nsri_stations'>) => {
    //     if (!item.service_area || !polygon) return;
    //
    //     const path = polygon.getPath();
    //     const coordinates = path.getArray().map(latlng => [latlng.lng(), latlng.lat()]);
    //
    //     const updatedServiceArea = {
    //         ...item.service_area,
    //         coordinates: [coordinates]
    //     };

    //     const updatedItem = {
    //         ...item,
    //         service_area: updatedServiceArea,
    //         updated_at: new Date().toISOString()
    //     };
    //
    //     dispatch(updateItemAction('nsri_stations', {column: 'id', value: item.id, data: updatedItem}, 'client'));
    // }, [dispatch, polygon]);

    const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
        if (!editState.focused || !isStation(editState.focused)) return;
        const newPolygonPath = polygon.getPath().getArray().map(pos => [pos.lng(), pos.lat()]);
        const newPolygon = {
            type: 'Polygon',
            coordinates: [newPolygonPath]
        } as PolygonType;
        const updatedItem = {
            ...editState.focused,
            service_area: newPolygon,
            updated_at: new Date().toISOString()
        };
        dispatch(updateItemAction('nsri_stations', {
            column: 'id',
            value: editState.focused.id,
            data: updatedItem
        }, 'client'));
        setEditState(prevState => ({...prevState, typeSpecific: {polygonCreate: false}}));
        polygon.setMap(null);
    }, [dispatch, editState.focused]);


    // const FpsComponent = ({quality, fps}: { quality: Record<string, any>, fps: number }) => {
    //     // const {levelOfDetail, resetLOD} = useFps();
    //     // const fps = useFPS();
    //     // const qualityLevels: QualityLevels = [
    //     //     {level: LEVEL_OF_DETAIL.HIGH, thresholdFPS: 60},
    //     //     {level: LEVEL_OF_DETAIL.MEDIUM, thresholdFPS: 30},
    //     //     {level: LEVEL_OF_DETAIL.LOW, thresholdFPS: 15},
    //     // ];
    //
    //     // const qualityLevels = {
    //     //     [LEVEL_OF_DETAIL.HIGH]: {
    //     //         name: 'high', level: LEVEL_OF_DETAIL.HIGH
    //     //     },
    //     //     [LEVEL_OF_DETAIL.MEDIUM]: {
    //     //         name: 'medium', level: LEVEL_OF_DETAIL.MEDIUM
    //     //     },
    //     //     [LEVEL_OF_DETAIL.LOW]: {
    //     //         name: 'low', level: LEVEL_OF_DETAIL.LOW
    //     //     },
    //     // }
    //     //
    //     // const quality = useAdaptiveQuality(qualityLevels, 10, 20, 3000); // threshold = 20, adjustmentDelay = 3000ms
    //
    //     return (
    //         <Card className="w-20">
    //             <CardContent>
    //                 <div className="flex flex-col space-y-2">
    //                     <span className="text-sm font-semibold">FPS</span>
    //                     {/*<span className="text-2xl font-semibold">{levelOfDetail}</span>*/}
    //                     {/*<span className="text-2xl font-semibold">{quality.name}</span>*/}
    //                     <span className="text-2xl font-semibold">{fps.toFixed(0)}</span>
    //                     {/*<Button onClick={resetLOD} className="text-sm py-1 px-2">*/}
    //                     {/*    Reset*/}
    //                     {/*</Button>*/}
    //                 </div>
    //             </CardContent>
    //         </Card>
    //     )
    // }

    const isMobile = useMediaQuery("(max-width: 768px)"); // Adjust as needed for your mobile breakpoint
    // const fps = useFPS(10);
    //
    // //
    // // Use hook for FPS
    // const {quality: _quality, fps} = useAdaptiveQuality(
    //     {
    //         [LEVEL_OF_DETAIL.HIGH]: {
    //             name: 'high', level: LEVEL_OF_DETAIL.HIGH
    //         },
    //         [LEVEL_OF_DETAIL.MEDIUM]: {
    //             name: 'medium', level: LEVEL_OF_DETAIL.MEDIUM
    //         },
    //         [LEVEL_OF_DETAIL.LOW]: {
    //             name: 'low', level: LEVEL_OF_DETAIL.LOW
    //         },
    //     }, 5, 25, 5000); // threshold = 20, adjustmentDelay = 3000ms

    // const quality = useMemo(() => _quality, [_quality]);

    // useEffect(() => {
    //     if (!quality) return;
    //     dispatch({type: actionTypes.SET_QUALITY, payload: quality});
    // }, [dispatch]);

    // const fps = useFPS(2);


    // const [isHighPerformance, setIsHighPerformance] = useState(false);

    // useEffect(() => {
    //     // Example condition for high-performance (can be replaced with your own logic)
    //     const highPerformance = navigator.hardwareConcurrency > 4; // For instance, systems with more than 4 logical processors
    //
    //     console.log('highPerformance', highPerformance);
    //     console.log('navigator.hardwareConcurrency', navigator.hardwareConcurrency);
    //     setIsHighPerformance(highPerformance);
    //
    //     // Set the custom attribute on the body element
    //     if (highPerformance) {
    //         document.body.setAttribute('data-performance', 'high');
    //     } else {
    //         document.body.removeAttribute('data-performance');
    //     }
    // }, []);

    useEffect(() => {
        // const highPerformance = navigator.hardwareConcurrency > 4;
        const htmlElement = document.documentElement;
        if (!state.settings.toggles.enable_performance_mode.enabled) {
            htmlElement.classList.add('hp');
        } else {
            htmlElement.classList.remove('hp');
        }
    }, [state.settings.toggles.enable_performance_mode]);


    //
    // useEffect(() => {
    //     console.log('state.quality?.level', state.quality?.level)
    //     console.log('state.quality', state.quality)
    // }, [state.quality]);
    // const quality = {name: 'high', level: LEVEL_OF_DETAIL.HIGH};

    return (
        <>

            {/*/!* Custom layer combobox *!/*/}
            {/*<MapControl position={ControlPosition.TOP_LEFT}>*/}
            {/*    <MapMenubar*/}
            {/*        className={cn("ml-2 mt-2 border border-gray-400 dark:border-gray-600 mt-[3.5rem] h-10", glassEffect)}*/}
            {/*        sync={sync}*/}
            {/*    />*/}
            {/*</MapControl>*/}


            {/*{isMobile ? (*/}

            {/*<MapControl position={ControlPosition.TOP_CENTER}>*/}
            {/*/!*    invisible div to sit underneath the navbar *!/*/}
            {/*    <div className="w-screen h-10 mt-[3.5rem] left-0"/>*/}

            {/*</MapControl>*/}


            {drawingLib && editState.focused && isStation(editState.focused) && editState.typeSpecific?.polygonCreate && (
                <DrawingManagerComponent
                    drawingMode={DrawingMode.POLYGON}
                    options={{drawingControl: false}}
                    onPolygonComplete={onPolygonComplete}
                />
            )}

            <MapControl position={ControlPosition.TOP_LEFT}>

                <div className="flex flex-start">
                    {/* Menubar Transition */}
                    <Transition
                        show={isMobile ? !editState.open : true}
                        enter="transition-opacity ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        // className={`transform-gpu z-20 ${isMobile ? "absolute top-[3.5rem] left-2" : "ml-2 mt-[3.5rem]"}`}
                        // className={`transform-gpu z-20 ml-2 mt-[3.5rem] md:ml-0 md:mt-0 md:absolute md:top-[3.5rem] md:left-2`}
                        className={`transform-gpu z-20 md:ml-2 md:mt-[3.5rem] ml-0 mt-0 absolute top-[3.5rem] left-2 md:static`}
                    >
                        <MapMenubar
                            // className="border border-gray-400 dark:border-gray-600 h-10"
                            className={cn("border border-gray-400 dark:border-gray-600 h-10", glassEffect,
                                "",
                                // "hocus:bg-yellow-500 hocus:bg-zinc-500",
                                // state.quality?.level !== 2 ? glassEffect : noGlassEffect
                            )}
                            sync={sync}
                        />
                    </Transition>

                    {/* EditNav Transition */}
                    <Transition
                        show={editState.open}
                        appear={true}
                        afterLeave={() => setEditState(prevState => ({...prevState, focused: null}))}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="opacity-0 -translate-x-full"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 -translate-x-full"
                        // className={`transform-gpu z-10 ${isMobile ? "absolute top-[3.5rem] left-2" : "ml-2 mt-[3.5rem]"}`}
                        // className={`transform-gpu z-20 ml-2 mt-[3.5rem] md:ml-0 md:mt-0 md:absolute md:top-[3.5rem] md:left-2`}
                        className={`transform-gpu z-20 md:ml-2 md:mt-[3.5rem] ml-0 mt-0 mb-0 absolute left-0 sm:left-2 sm:top-[3.5rem] top-[3rem] md:static`}
                    >
                        <EditNav editState={editState} setEditState={setEditState}
                                 className={cn("border border-gray-400 dark:border-gray-60", glassEffect
                                     // state.quality?.name !== 'low' ? glassEffect : noGlassEffect
                                 )}
                                 icon={renderIcon}
                                 name={renderName}
                                 buttons={buttonsConfig(editState, setEditState)}
                        />
                    </Transition>

                </div>
            </MapControl>

            {/* Custom fullscreen */
            }
            <MapControl position={ControlPosition.TOP_RIGHT}>
                <FullScreenToggle
                    className={cn("mr-2 border border-gray-400 dark:border-gray-600 mt-[3.5rem]", glassEffect
                        // state.quality?.name !== 'low' ? glassEffect : noGlassEffect
                    )}/>
            </MapControl>

            {
                editState.focused && editState.formOpen && (
                    <EditRescueBuoyForm
                        buoy={editState.focused}
                        open={editState.formOpen}
                        onClose={() => setEditState((prevState) => ({...prevState, formOpen: false}))}/>
                )
            }

            {/* Zoom controls */
            }
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <ZoomControls className="mr-2 mb-2"/>
            </MapControl>

            {/*<MapControl position={ControlPosition.LEFT_CENTER}>*/}
            {/*    <FpsComponent quality={quality} fps={fps}/>*/}
            {/*</MapControl>*/}

            {/* Filter controls */
            }
            {/*<MapControl position={ControlPosition.LEFT_BOTTOM}>*/
            }
            {/*    <FilterControl*/
            }
            {/*        className="ml-2 mb-2 border border-gray-400 dark:border-gray-600"*/
            }
            {/*        onDataFiltered={handleDataFiltered} open={open} setOpen={setOpen}*/
            }
            {/*    />*/
            }
            {/*</MapControl>*/
            }

            {/* Settings */
            }
            <MapControl position={ControlPosition.LEFT_BOTTOM}>
                <MapSettingsControl onSettingChange={(id: string, enabled: boolean) => dispatch({
                    type: actionTypes.TOGGLE_SETTING,
                    payload: id as keyof State['settings']['toggles']
                })} className="ml-2 mb-2 border border-gray-400 dark:border-gray-600"/>
            </MapControl>

            {/* Custom layer combobox */
            }
            <MapControl position={ControlPosition.LEFT_BOTTOM}>
                <LayerCombobox className="ml-2 mb-2 border border-gray-400 dark:border-gray-600"/>
            </MapControl>

            {/* Enable current location */
            }
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <UserLocation className="mr-2 mb-2 border border-gray-400 dark:border-gray-600"/>
            </MapControl>

            {/* User location */
            }
            <MapUserLocation userLocation={state.location.value}/>

            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <Popover>
                    <PopoverTrigger disabled={!isUnsynchronized}>
                        <Button
                            className={cn('ml-2 mt-2 border p-0 border-gray-400 dark:border-gray-600 mb-2 mr-2 bg-white dark:bg-gray-800 dark:bg-opacity-70 h-10 w-10',
                                isUnsynchronized ? "" : "invisible")}
                            disabled={!isUnsynchronized}>
                            {isUnsynchronized ? (
                                <PencilSquareIcon
                                    className={'h-6 p-0 w-6 text-red-600 dark:text-red-400 animate-pulse'}/>
                            ) : (
                                <PencilSquareIcon className={'h-6 p-0 w-6 text-gray-400 dark:text-gray-600'}/>
                            )}

                        </Button>
                    </PopoverTrigger>
                    {/*must be scrollable*/}
                    <PopoverContent
                        className={'w-96 h-96 overflow-auto space-y-5 h-full rounded max-h-96 overflow-auto'}>
                        {aggregatedChanges && (
                            // iterate dict
                            // for each item, iterate changes
                            // for each change, render a diff
                            Object.entries(aggregatedChanges).map(([key, value], index) => (
                                <ChangesDiffViewer
                                    key={index}
                                    oldData={value.oldItem}
                                    newData={value.newItem}
                                    diffOptions={{includeArrayIndex: true}}
                                />
                            ))
                        )}
                    </PopoverContent>
                </Popover>
            </MapControl>

            {/* CLUSTERER */
            }
            <MarkerClusterer enabled={state.settings.toggles.enable_clustering.enabled} {...state.settings.clusterer}>

                {state.settings.toggles.show_buoys.enabled && state.tables.rescue_buoys.values.map((item: Tables<'rescue_buoys'>, index: number) => (
                    <AdvancedMarkerWithHooksRescueBuoys
                        key={`buoy-${item.id}-${index}-marker`}
                        item={item}
                        onDragEnd={(e, marker, item) => onDragEndMarkerUpdate(e, 'rescue_buoys', item)}
                        onClick={(e, marker, item) => {
                            // setFocused(item);
                        }}
                        draggable={!editState.locked && editState.focused?.id === item.id}
                        components={
                            {
                                PinContent: BuoyPinContent,
                                InfoWindowContent: BuoyInfoWindowContent,
                            }
                        }
                        // synchronized={!state.tables.rescue_buoys.changes.some(change => change.id === item.id && !change.synchronized)}
                        data={{
                            synchronized: !state.tables.rescue_buoys.changes.some(change => change.id === item.id && !change.synchronized),
                            selected: (editState.focused?.id === item.id),
                            onCloseClick: closeInfoWindow,
                            onEditClick: () => handleEditClick(item),
                        }
                        }
                    />
                ))}


                {state.settings.toggles.show_stations.enabled && state.tables.nsri_stations.values.map((item: Tables<'nsri_stations'>, index: number) => (
                    <>
                        <AdvancedMarkerWithHooksNsriStations
                            key={`station-${item.id}-${index}-marker`}
                            item={item}
                            onDragEnd={(e, marker, item) => onDragEndMarkerUpdate(e, 'nsri_stations', item)}
                            // onClick={(e, marker, item) => {
                            //     // setFocused(item);
                            // }}
                            draggable={!editState.locked && editState.focused?.id === item.id}
                            components={
                                {
                                    PinContent: StationPinContent,
                                    InfoWindowContent: StationInfoWindowContent,
                                }
                            }
                            data={
                                {
                                    synchronized: !state.tables.nsri_stations.changes.some(change => change.id.toString() === item.id.toString() && !change.synchronized),
                                    onCloseClick: closeInfoWindow,
                                    selected: editState.focused?.id === item.id,
                                    onEditClick: () => handleEditClick(item),
                                }
                            }
                        />
                        {
                            item.service_area && (
                                <PolygonWithHooks
                                    key={`station-${item.id}-${index}-polygon`}
                                    item={item}
                                    // paths={serviceArea.features[0].geometry.coordinates[0].map((coordinate: number[]) => {
                                    paths={item.service_area.coordinates[0].map((coordinate: number[]) => {
                                        return {lat: coordinate[1], lng: coordinate[0]}
                                    })}
                                    onClick={(e) => {
                                        console.log(e);
                                    }}
                                    onDrag={(e) => {
                                        console.log(e);
                                    }
                                    }
                                    onDragEnd={(e) => {
                                        console.log(e);
                                    }
                                    }
                                    editable={editState.focused?.id === item.id && !editState.locked}
                                    // draggable={true}
                                    fillColor={'#4c5eab'}
                                    fillOpacity={0.35}
                                    strokeColor={'#4c5eab'}
                                    strokeOpacity={0.8}
                                    strokeWeight={2}
                                />
                            )
                        }
                    </>
                ))}


            </MarkerClusterer>
        </>
    )
        ;
};

export default React.memo(SimpleMap);
