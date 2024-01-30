"use client";

import {createContext, useCallback, useEffect, useMemo, useReducer} from "react";


const RESCUE_BUOYS = 'rescue_buoys';
const NSRI_STATIONS = 'nsri_stations';


// Define your action types
export const actionTypes = {
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
export type MapState = {
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
    payload: keyof MapState['settings']['toggles'];
}

interface SetLoadingAction {
    type: typeof actionTypes.SET_LOADING;
    payload: {
        key: keyof MapState['settings']['toggles'];
        loading: boolean;
    };
}

interface SetLocationAction {
    type: typeof actionTypes.SET_LOCATION;
    payload: MapState['location'];
}

interface SetInfoWindowAction {
    type: typeof actionTypes.SET_INFO_WINDOW;
    payload: Partial<MapState['info_window']>;
}

interface SetQualityAction {
    type: typeof actionTypes.SET_QUALITY;
    payload: Record<string, any>;
}

export type MapAction =
    | ToggleSettingAction
    | SetLoadingAction
    | SetLocationAction;


// Create the reducer function
const reducer = (state: MapState, action: MapAction): MapState => {
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


const initialState: MapState = {
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
    state: (TableState<'rescue_buoys'> & TableState<'nsri_stations'> & MapState);
    dispatch: React.Dispatch<TableActions<'rescue_buoys'> | TableActions<'nsri_stations'> | MapAction>
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

import {useGeolocation, useLocalStorage} from "@uidotdev/usehooks";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {Database, Tables} from "@/types/supabase";
import {Algorithm, AlgorithmOptions} from "@googlemaps/markerclusterer";


// Define a function to set up real-time updates
export const AppProvider = ({children}: { children: React.ReactNode }) => {
    "use client";
    // const [localTables, setLocalTables] = useLocalStorage(TABLE_STATE_STORAGE_KEY, {
    //     rescue_buoys: {
    //         ...createInitialState('rescue_buoys').tables.rescue_buoys,
    //         values: [], changes: [], realtime: {enabled: true}, filters: [
    //             createFilter('rescue_buoys')('status', 'neq', 'UNKNOWN')
    //         ]
    //     },
    //     nsri_stations: {
    //         ...createInitialState('nsri_stations').tables.nsri_stations,
    //         values: [], changes: [], realtime: {enabled: true}
    //     }
    //
    // });

    // const localStorageChanges = localStorage.getItem(TABLE_STATE_STORAGE_KEY);
    const supabase = useSupabaseClient<Database>();

    // Safely parse the local storage data
    const getInitialTables = () => {
        // if (localTables) {
        //     try {
        //         return {tables: localTables}
        //     } catch (error) {
        //         console.error('Error parsing local storage data:', error);
        //     }
        // }
        // Default initial state if local storage is empty, undefined, or in case of error
        return {
            tables: {
                rescue_buoys: {
                    ...createInitialState('rescue_buoys').tables.rescue_buoys,
                    values: [], changes: [], realtime: {enabled: true}, filters: [
                        createFilter('rescue_buoys')('status', 'neq', 'UNKNOWN')
                    ]
                },
                nsri_stations: {
                    ...createInitialState('nsri_stations').tables.nsri_stations,
                    values: [], changes: [], realtime: {enabled: true}
                }
            }
        };
    };

    // Define your reducer function
    // const supabase = useSupabaseClient<Database>();
    const [mapState, mapDispatch] = useReducer(reducer, initialState);
    const [tableState, tableDispatch] = useReducer(
        tableReducer<'rescue_buoys' & 'nsri_stations'>, getInitialTables()
    );

    const state = useMemo(() => combineState(mapState, tableState), [mapState, tableState]);

    console.log(state);
    useEffect(() => {
        console.log('state changed')
    }, [state]);
    const dispatch = useCallback(combineDispatch(mapDispatch, tableDispatch), [mapDispatch, tableDispatch]);

    // After reducer logic, save the changes to local storage
    // useEffect(() => {
    //     if (state.tables) {
    //         setLocalTables(state.tables);
    //     }
    //     // localStorage.setItem(TABLE_STATE_STORAGE_KEY, JSON.stringify(state.tables));
    //     // setLocalTables(state.tables);
    // }, [setLocalTables, state.tables]);


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