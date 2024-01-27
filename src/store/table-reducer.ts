"use client";

import {v4 as uuidv4} from 'uuid';
import {Database, Tables, TablesInsert, TablesUpdate} from '@/types/supabase';
import supabase from "@/supabase";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Dispatch, useCallback, useEffect} from "react";
import {REALTIME_POSTGRES_CHANGES_LISTEN_EVENT} from "@supabase/realtime-js/dist/module/RealtimeChannel";
import {toast} from "sonner";

export enum POSTGRES_CHANGES_EVENT {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export const TABLE_STATE_STORAGE_KEY = 'table-state'


export enum ACTION_TYPES {
    INSERT_ITEM = 'INSERT_ITEM',
    UPDATE_ITEM = 'UPDATE_ITEM',
    DELETE_ITEM = 'DELETE_ITEM',
    SET_ITEMS = 'SET_ITEMS',

    POSTGRES_UPDATE_ITEM = 'POSTGRES_UPDATE_ITEM',
    POSTGRES_INSERT_ITEM = 'POSTGRES_INSERT_ITEM',
    POSTGRES_DELETE_ITEM = 'POSTGRES_DELETE_ITEM',
    REALTIME_SUBSCRIBE_CALLBACK = 'REALTIME_SUBSCRIBE_CALLBACK',

    UPDATE_CHANGE_STATUS = 'UPDATE_CHANGE_STATUS',
};

// const ACTION_TYPES = 'INSERT_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'SET_ITEMS' | 'SET_SUPABASE';

export function insertItem<T extends keyof Database['public']['Tables']>(array: Tables<T>[], item: Tables<T>): Tables<T>[] {
    return [...array, item];
}

export function updateItem<T extends keyof Database['public']['Tables']>(array: Tables<T>[], item: Partial<Tables<T>>, column: keyof Tables<T>, value: Tables<T>[keyof Tables<T>]): Tables<T>[] {
    return array.map(arrayItem =>
        arrayItem[column] === value
            ? {...arrayItem, ...item}
            : arrayItem
    );
}

export function updateItemWithChange<T extends keyof Database['public']['Tables']>(array: Tables<T>[], item: Partial<Tables<T>>, column: keyof Tables<T>, value: Tables<T>[keyof Tables<T>])
    : { newArray: Tables<T>[], oldItem: Tables<T> | {}, newItem: Tables<T> | {} } {
    const index = array.findIndex(arrayItem => arrayItem[column] === value);
    if (index === -1) return {newArray: array, oldItem: {}, newItem: {}}
    const newArray = [...array];
    const oldItem = newArray[index];
    const newItem = {...oldItem, ...item};
    newArray[index] = newItem;
    return {newArray, oldItem, newItem};
}

export function updateItemMatch<T extends keyof Database['public']['Tables']>(array: Tables<T>[], oldItem: Partial<Tables<T>>, newItem: Tables<T> | {}): Tables<T>[] {
    return array.map(arrayItem =>
        arrayItem === oldItem
            ? {...arrayItem, ...newItem}
            : arrayItem
    );
}

export function deleteItem<T extends keyof Database['public']['Tables']>(array: Tables<T>[], identifierValue: Tables<T>[keyof Tables<T>], identifier: keyof Tables<T>): Tables<T>[] {
    return array.filter(arrayItem => arrayItem[identifier] !== identifierValue);
}

export function deleteItemWithChange<T extends keyof Database['public']['Tables']>(array: Tables<T>[], identifierValue: Tables<T>[keyof Tables<T>], identifier: keyof Tables<T>): {
    newArray: Tables<T>[],
    oldItem: Tables<T> | {}
} {
    const index = array.findIndex(arrayItem => arrayItem[identifier] === identifierValue);
    if (index === -1) return {newArray: array, oldItem: {}}
    const newArray = [...array];
    const oldItem = newArray[index];
    newArray.splice(index, 1);
    return {newArray, oldItem};
}

export function setItems<T extends keyof Database['public']['Tables']>(items: Tables<T>[]): Tables<T>[] {
    return [...items];
}


type RealtimePostgresChangesPayloadBase = {
    schema: string
    table: string
    commit_timestamp: string
    errors: string[]
}

export type RealtimePostgresInsertPayload<T extends { [key: string]: any }> =
    RealtimePostgresChangesPayloadBase & {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT}`
    new: T
    old: {}
}

export type RealtimePostgresUpdatePayload<T extends { [key: string]: any }> =
    RealtimePostgresChangesPayloadBase & {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE}`
    new: T
    old: Partial<T>
}

export type RealtimePostgresDeletePayload<T extends { [key: string]: any }> =
    RealtimePostgresChangesPayloadBase & {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE}`
    new: {}
    old: Partial<T>
}

interface DeletePayload<T extends keyof Database['public']['Tables']> {
    column: keyof Tables<T>,
    value: Tables<T>[keyof Tables<T>]
}

type UpdatePayload<T extends keyof Database['public']['Tables']> = {
    column: keyof Tables<T>,
    value: Tables<T>[keyof Tables<T>],
    data: Partial<Tables<T>>
}

type InsertPayload<T extends keyof Database['public']['Tables']> = Tables<T>;


type SetPayload<T extends keyof Database['public']['Tables']> = Tables<T>[];



export const enum SOURCE {
    SERVER = 'server',
    CLIENT = 'client'
}


// Generic Action interface
export interface TableAction<K extends keyof Database['public']['Tables']> {
    type: `${ACTION_TYPES}`;
    table: K;
    payload: DeletePayload<K>
        | UpdatePayload<K>
        | InsertPayload<K>
        | SetPayload<K>
        | RealtimePostgresUpdatePayload<Tables<K>>
        | RealtimePostgresInsertPayload<Tables<K>>
        | RealtimePostgresDeletePayload<Tables<K>>;
    source: `${SOURCE}`;
}

// Specific Action interfaces
interface InsertItemAction<K extends keyof Database['public']['Tables']> extends TableAction<K> {
    type: ACTION_TYPES.INSERT_ITEM,
    payload: InsertPayload<K>
}

interface UpdateItemAction<K extends keyof Database['public']['Tables']> extends TableAction<K> {
    type: `${ACTION_TYPES.UPDATE_ITEM}`
    payload: UpdatePayload<K>
}

interface DeleteItemAction<K extends keyof Database['public']['Tables']> extends TableAction<K> {
    type: `${ACTION_TYPES.DELETE_ITEM}`
    payload: DeletePayload<K>
}

interface SetItemsAction<K extends keyof Database['public']['Tables']> {
    table: K;
    type: ACTION_TYPES.SET_ITEMS,
    payload: SetPayload<K>
}

interface PostgresUpdateItemAction<K extends keyof Database['public']['Tables']> extends TableAction<K> {
    type: `${ACTION_TYPES.POSTGRES_UPDATE_ITEM}`
    payload: RealtimePostgresUpdatePayload<Tables<K>>
}

interface PostgresInsertItemAction<K extends keyof Database['public']['Tables']> extends TableAction<K> {
    type: `${ACTION_TYPES.POSTGRES_INSERT_ITEM}`
    payload: RealtimePostgresInsertPayload<Tables<K>>
}

interface PostgresDeleteItemAction<K extends keyof Database['public']['Tables']> extends TableAction<K> {
    type: `${ACTION_TYPES.POSTGRES_DELETE_ITEM}`
    payload: RealtimePostgresDeletePayload<Tables<K>>
}

interface UpdateChangeStatusAction<K extends keyof Database['public']['Tables']> {
    type: `${ACTION_TYPES.UPDATE_CHANGE_STATUS}`
    table: K;
    payload: {
        id: string;
        synchronized: boolean;
    };
}

interface PostgresRealtimeCallback<K extends keyof Database['public']['Tables']> {
    type: `${ACTION_TYPES.REALTIME_SUBSCRIBE_CALLBACK}`
    table: K;
    payload: {
        status: `${REALTIME_SUBSCRIBE_STATES}`;
        error?: Error;
    };

}


export type TableActions<K extends keyof Database['public']['Tables']> =
    | InsertItemAction<K>
    | UpdateItemAction<K>
    | DeleteItemAction<K>
    | SetItemsAction<K>
    | PostgresUpdateItemAction<K>
    | PostgresInsertItemAction<K>
    | PostgresDeleteItemAction<K>
    | UpdateChangeStatusAction<K>
    | PostgresRealtimeCallback<K>;


export const updateChangeStatusAction = <K extends keyof Database['public']['Tables']>(table: K, id: string, synchronized: boolean): UpdateChangeStatusAction<K> => ({
    type: ACTION_TYPES.UPDATE_CHANGE_STATUS,
    table,
    payload: {
        id,
        synchronized
    }
});

export const insertItemAction = <T extends keyof Database['public']['Tables']>(table: T, item: Tables<T>, source: `${SOURCE}`): InsertItemAction<T> => ({
    type: ACTION_TYPES.INSERT_ITEM,
    table,
    payload: item,
    source
});

export const updateItemAction = <T extends keyof Database['public']['Tables']>(table: T, item: UpdatePayload<T>, source: `${SOURCE}`): UpdateItemAction<T> => ({
    type: ACTION_TYPES.UPDATE_ITEM,
    table,
    payload: item,
    source
});

export const deleteItemAction = <T extends keyof Database['public']['Tables']>(table: T, item: DeletePayload<T>, source: `${SOURCE}`): DeleteItemAction<T> => ({
    type: ACTION_TYPES.DELETE_ITEM,
    table,
    payload: item,
    source
});

export const setItemsAction = <T extends keyof Database['public']['Tables']>(table: T, items: Tables<T>[]): SetItemsAction<T> => ({
    type: ACTION_TYPES.SET_ITEMS,
    table,
    payload: items
});

export const updateItemPostgresAction = <T extends keyof Database['public']['Tables']>(table: T, payload: RealtimePostgresUpdatePayload<Tables<T>>): PostgresUpdateItemAction<T> => ({
    type: ACTION_TYPES.POSTGRES_UPDATE_ITEM,
    table,
    payload,
    source: SOURCE.SERVER
});

export const deleteItemPostgresAction = <T extends keyof Database['public']['Tables']>(table: T, payload: RealtimePostgresDeletePayload<Tables<T>>): PostgresDeleteItemAction<T> => ({
    type: ACTION_TYPES.POSTGRES_DELETE_ITEM,
    table,
    payload,
    source: SOURCE.SERVER
});

export const insertItemPostgresAction = <T extends keyof Database['public']['Tables']>(table: T, payload: RealtimePostgresInsertPayload<Tables<T>>): PostgresInsertItemAction<T> => ({
    type: ACTION_TYPES.POSTGRES_INSERT_ITEM,
    table,
    payload,
    source: SOURCE.SERVER
});

export enum REALTIME_SUBSCRIBE_STATES {
    SUBSCRIBED = 'SUBSCRIBED',
    TIMED_OUT = 'TIMED_OUT',
    CLOSED = 'CLOSED',
    CHANNEL_ERROR = 'CHANNEL_ERROR',
}

type StringFilterCondition<K extends keyof Database['public']['Tables']> = {
    column: keyof Tables<K>;
    operand: 'like';
    value: string; // Ensuring value is a string for 'like' operand
};

type GeneralFilterCondition<K extends keyof Database['public']['Tables']> = {
    column: keyof Tables<K>;
    operand: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
    value: Tables<K>[keyof Tables<K>];
};

type FilterCondition<K extends keyof Database['public']['Tables']> =
    StringFilterCondition<K>
    | GeneralFilterCondition<K>;


type Filter<K extends keyof Database['public']['Tables']> =
    FilterCondition<K>[]
    |
    ((item: Tables<K>) => boolean);

export function createFilter<K extends keyof Database['public']['Tables']>(
    table: K
) {
    return <M extends keyof Tables<K>>(
        column: M,
        operand: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in',
        value: Tables<K>[M]
    ): FilterCondition<K> => ({
        column,
        operand,
        value
    });
}

// export const createFilter = <
//     K extends keyof Database['public']['Tables'],
//     M extends keyof Tables<K>
// >(
//     column: M,
//     operand: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in',
//     value: Tables<K>[M]
// ): FilterCondition<K> => ({
//     column,
//     operand,
//     value
// });

// FilterCondition<K> |


export function applyFilters<K extends keyof Database['public']['Tables']>(
    data: Tables<K>[],
    filters: Filter<K>
): Tables<K>[] {
    if (typeof filters === 'function') {
        // If filters is a function, apply it directly
        return data.filter(filters);
    } else {
        // If filters is an array of conditions
        return data.filter(item => {
            return filters.every(filterCondition => {
                const {column, operand, value} = filterCondition;

                switch (operand) {
                    case 'eq':
                        return item[column] === value;
                    case 'neq':
                        return item[column] !== value;
                    case 'gt':
                        return item[column] > value;
                    case 'lt':
                        return item[column] < value;
                    case 'gte':
                        return item[column] >= value;
                    case 'lte':
                        return item[column] <= value;
                    case 'in':
                        return Array.isArray(value) && value.includes(item[column]);
                    case 'like':
                        return new RegExp(value, 'i').test(String(item[column]));
                    default:
                        return true;
                }
            });
        });
    }
}


function convertToSupabaseFilters<T extends keyof Database['public']['Tables']>(filters: Filter<T>): any {
    if (typeof filters === 'function') {
        console.warn('Custom functions cannot be converted to Supabase filters.');
        return;
    } else {
        // If filters is an array of conditions
        return filters.map(filter => {
                const {column, operand, value} = filter;
                return {[column]: {[operand]: value}};
            }
        );
    }
}


interface ChangeBase<T extends keyof Database['public']['Tables']> {
    id: string;
    payload: DeletePayload<T>
        | UpdatePayload<T>
        | InsertPayload<T>
        | RealtimePostgresUpdatePayload<Tables<T>>
        | RealtimePostgresInsertPayload<Tables<T>>
        | RealtimePostgresDeletePayload<Tables<T>>;
    source: `${SOURCE}`;
    type: `${POSTGRES_CHANGES_EVENT}`;
    synchronized: boolean;
    conflict: boolean;
    newItem?: Tables<T> | {};
    oldItem?: Tables<T> | Partial<Tables<T>> | {};
}


interface ClientChangeInsert<T extends keyof Database['public']['Tables']> extends ChangeBase<T> {
    payload: InsertPayload<T> | RealtimePostgresInsertPayload<Tables<T>>;
    type: `${POSTGRES_CHANGES_EVENT.INSERT}`
    oldItem: {}
    newItem: Tables<T>
    source: `${SOURCE.CLIENT}`
}

interface ClientChangeUpdate<T extends keyof Database['public']['Tables']> extends ChangeBase<T> {
    payload: UpdatePayload<T> | RealtimePostgresUpdatePayload<Tables<T>>;
    type: `${POSTGRES_CHANGES_EVENT.UPDATE}`
    oldItem: Partial<Tables<T>>
    newItem: Tables<T>
    source: `${SOURCE.CLIENT}`
}

interface ClientChangeDelete<T extends keyof Database['public']['Tables']> extends ChangeBase<T> {
    payload: DeletePayload<T>;
    type: `${POSTGRES_CHANGES_EVENT.DELETE}`
    oldItem: Partial<Tables<T>>
    newItem: {}
    source: `${SOURCE.CLIENT}`
}

export type Change<T extends keyof Database['public']['Tables']> =
    | ClientChangeInsert<T>
    | ClientChangeUpdate<T>
    | ClientChangeDelete<T>;

interface HistoryState<T extends keyof Database['public']['Tables']> {
    past: Array<Change<T>>;
    present: Change<T> | null;
    future: Array<Change<T>>;
}


export interface TableState<T extends keyof Database['public']['Tables']> {
    tables: {
        [K in T]: {
            values: Tables<K>[];
            changes: Change<K>[];
            history: HistoryState<K>;
            sync: {
                enabled: boolean;
                status: 'idle' | 'loading' | 'error';
                error?: Error;
            };
            realtime: {
                enabled: boolean;
                status: `${REALTIME_SUBSCRIBE_STATES}`;
                error?: Error;
            };
            filters: Filter<K>[]; // Add this line to include filters
        }
    };
}


// Define a type guard function
function isTableState<T extends keyof Database['public']['Tables']>(
    obj: any,
    table: T
): obj is TableState<T> {
    return obj.hasOwnProperty(table);
}

export const createInitialState = <T extends keyof Database['public']['Tables']>(table: T): TableState<T> => {
    // Define the initial state for a single table
    const singleTableState: TableState<T>['tables'][T] = {
        values: [] as Tables<T>[],
        changes: [] as Change<T>[],
        history: {
            past: [] as Change<T>[],
            present: null,
            future: [] as Change<T>[]
        },
        sync: {
            enabled: true,
            status: 'idle',
            error: undefined
        },
        realtime: {
            enabled: true,
            status: REALTIME_SUBSCRIBE_STATES.CLOSED,
            error: undefined
        },
        filters: [] as Filter<T>[]
    };

    // Construct the TableState object with the proper typing
    const tableState: TableState<T> = {
        tables: {
            [table]: singleTableState
        }
    } as TableState<T>;

    return tableState;
};




type FirstKey<T> = Extract<keyof T, string>;

const getFirstKeyAndValue = <T extends keyof Database['public']['Tables']>(item: Tables<T>): [keyof Tables<T>, Tables<T>[keyof Tables<T>]] => {
    const firstKey = Object.keys(item)[0] as FirstKey<Tables<T>>
    return [firstKey, item[firstKey]];
};

// Modified reducer function with generic type
const tableReducer = <T extends keyof Database['public']['Tables']>(
    state: TableState<T>,
    action: TableActions<T>
): TableState<T> => {
    console.log('action', action);
    console.log('state', state);
    switch (action.type) {
        case `${ACTION_TYPES.INSERT_ITEM}`: {
            const {table, payload, source} = action as InsertItemAction<typeof action.table>;
            const oldItem = {};
            const newItem = payload;
            const [column, value] = getFirstKeyAndValue(payload);
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        values: insertItem<typeof table>(state.tables[table].values, payload),
                        changes: [
                            ...state.tables[table].changes,
                            {
                                id: value,
                                payload,
                                source,
                                newItem,
                                oldItem,
                                synchronized: source === 'server',
                                conflict: false,
                                type: `${POSTGRES_CHANGES_EVENT.INSERT}`
                            }
                        ]
                    }
                }
            };
        }

        case `${ACTION_TYPES.UPDATE_ITEM}`: {
            const {table, payload, source} = action as UpdateItemAction<T>;
            const {
                newArray,
                oldItem,
                newItem
            } = updateItemWithChange<typeof table>(state.tables[table].values, payload.data, payload.column, payload.value);
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        values: newArray,
                        changes: [
                            ...state.tables[table].changes,
                            {
                                // id: uuidv4(),
                                id: payload.value,
                                payload,
                                source,
                                newItem,
                                oldItem,
                                synchronized: source === 'server',
                                conflict: false,
                                type: `${POSTGRES_CHANGES_EVENT.UPDATE}`
                            }
                        ]
                    }
                }
            };
        }

        case `${ACTION_TYPES.DELETE_ITEM}`: {
            const {
                table,
                payload: {column, value},
                source
            } = action as DeleteItemAction<T>;
            const {newArray, oldItem} = deleteItemWithChange<typeof table>(state.tables[table].values, value, column);
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        values: deleteItem<typeof table>(state.tables[table].values, value, column),
                        changes: [
                            ...state.tables[table].changes,
                            {
                                // id: uuidv4(),
                                id: value,
                                payload: {column, value},
                                source,
                                newItem: {},
                                oldItem,
                                synchronized: source === 'server',
                                conflict: false,
                                type: `${POSTGRES_CHANGES_EVENT.DELETE}`
                            }
                        ]
                    }
                }
            };
        }

        case `${ACTION_TYPES.SET_ITEMS}`: {
            const {table, payload} = action as SetItemsAction<T>;
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        values: setItems<typeof table>(payload),
                    }
                }
            };
        }

        case `${ACTION_TYPES.POSTGRES_INSERT_ITEM}`: {
            const {table, payload} = action as PostgresInsertItemAction<T>;
            const [column, value] = getFirstKeyAndValue(payload.new);
            const existingIndex = state.tables[table].values.findIndex(item => item[column] === value);

            let updatedValues;
            if (existingIndex !== -1) {
                updatedValues = [...state.tables[table].values];
                // If the item already exists, decide how to handle it.
                // For example, replace it or merge changes:
                // updatedValues = [...state.tables[table].values];
                // updatedValues[existingIndex] = payload.new; // Replace the existing item
            } else {
                // If the item does not exist, add it to the state
                updatedValues = insertItem<typeof table>(state.tables[table].values, payload.new);
            }

            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        values: updatedValues,
                        changes: [
                            ...state.tables[table].changes,
                            {
                                id: payload.new[column],
                                payload,
                                source: SOURCE.SERVER,
                                oldItem: {},
                                newItem: payload.new,
                                synchronized: true,
                                conflict: false,
                                type: `${POSTGRES_CHANGES_EVENT.INSERT}`
                            }
                        ]
                    }
                }
            };
        }

        case `${ACTION_TYPES.POSTGRES_UPDATE_ITEM}`: {
            const {table, payload} = action as PostgresUpdateItemAction<T>;
            // column and value are the only { key: value } pair in the old object
            const [column, value] = Object.entries(payload.old).flat();
            const {
                newArray,
                oldItem,
                newItem
            } = updateItemWithChange<typeof table>(state.tables[table].values, payload.new, column as keyof Tables<T>, value as Tables<T>[keyof Tables<T>]);
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        values: newArray,
                        // values: updateItem<typeof table>(state.tables[table].values, payload.new, column as keyof Tables<T>, value as Tables<T>[keyof Tables<T>]),
                        changes: [
                            ...state.tables[table].changes,
                            {
                                id: uuidv4(),
                                payload,
                                source: SOURCE.SERVER,
                                newItem,
                                oldItem,
                                synchronized: true,
                                conflict: false,
                                type: `${POSTGRES_CHANGES_EVENT.UPDATE}`
                            }
                        ]
                    }
                }
            };
        }

        case `${ACTION_TYPES.POSTGRES_DELETE_ITEM}`: {
            const {table, payload} = action as PostgresDeleteItemAction<T>;

            const [column, value] = Object.entries(payload.old).flat();
            const {
                newArray,
                oldItem
            } = deleteItemWithChange<typeof table>(state.tables[table].values, value as Tables<T>[keyof Tables<T>], column as keyof Tables<T>);
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        // values: updateItemMatch<typeof table>(state.tables[table].values, payload.old, payload.new),
                        values: newArray,
                        changes: [
                            ...state.tables[table].changes,
                            {
                                id: uuidv4(),
                                payload,
                                source: SOURCE.SERVER,
                                newItem: {},
                                oldItem,
                                synchronized: true,
                                conflict: false,
                                type: `${POSTGRES_CHANGES_EVENT.DELETE}`
                            }
                        ]
                    }
                }
            };
        }

        case `${ACTION_TYPES.REALTIME_SUBSCRIBE_CALLBACK}`: {
            const {table, payload} = action as PostgresRealtimeCallback<T>;
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        realtime: {
                            ...state.tables[table].realtime,
                            ...payload
                        }
                    }
                }
            };
        }

        case `${ACTION_TYPES.UPDATE_CHANGE_STATUS}`: {
            const {table, payload: {id: changeId, synchronized}} = action as UpdateChangeStatusAction<T>;
            return {
                ...state,
                tables: {
                    ...state.tables,
                    [table]: {
                        ...state.tables[table],
                        changes: state.tables[table].changes.map(change =>
                            change.id === changeId ? {...change, synchronized} : change
                        ),
                    },
                },
            };
        }

        default:
            return state;

    }
}


// export type RealtimePostgresInsertPayload<T extends { [key: string]: any }> =
//     RealtimePostgresChangesPayloadBase & {
//     eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT}`
//     new: T
//     old: {}
// }
//
// export type RealtimePostgresUpdatePayload<T extends { [key: string]: any }> =
//     RealtimePostgresChangesPayloadBase & {
//     eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE}`
//     new: T
//     old: Partial<T>
// }
//
// export type RealtimePostgresDeletePayload<T extends { [key: string]: any }> =
//     RealtimePostgresChangesPayloadBase & {
//     eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE}`
//     new: {}
//     old: Partial<T>
// }

// export const useSyncChanges = <K extends keyof Database['public']['Tables']>(
//     {supabase, table, dispatch, state}: {
//         supabase: SupabaseClient<Database>,
//         table: K,
//         dispatch: Dispatch<any>,
//         state: TableState<K>
//     }
// ) => {
//     useEffect(() => {
//
//         for (const table of ['rescue_buoys', 'nsri_stations'] as const) {
//             for (const change of state.tables[table].changes) {
//                 if (change.source === 'client' && !change.synchronized) {
//                     if (change.type === 'INSERT') {
//                         supabase.from(table).insert(change.payload.data).then(({data, error}) => {
//                             if (error) {
//                                 console.error(error);
//                                 toast.error(error.message);
//                             } else {
//                                 dispatch(updateChangeStatusAction(table, change.id, true));
//                                 toast.success('Operation successful');
//                             }
//                         });
//                     } else if (change.type === 'UPDATE') {
//                         supabase.from(table).update(change.payload.data).match({[change.payload.column]: change.payload.value}).then(({
//                                                                                                                                           data,
//                                                                                                                                           error
//                                                                                                                                       }) => {
//                             if (error) {
//                                 console.error(error);
//                                 toast.error(error.message);
//                             } else {
//                                 dispatch(updateChangeStatusAction(table, change.id, true));
//                                 toast.success('Operation successful');
//                             }
//                         });
//                     } else if (change.type === 'DELETE') {
//                         supabase.from(table).delete().match({id: change.data.id}).then(({data, error}) => {
//                             if (error) {
//                                 console.error(error);
//                                 toast.error(error.message);
//                             } else {
//                                 dispatch(updateChangeStatusAction(table, change.id, true));
//                                 toast.success('Operation successful');
//                             }
//                         });
//                     }
//                 }
//             }
//         }
//     }, [state.tables, dispatch]);
// }

export const useRealtimeChanges = <K extends keyof Database['public']['Tables']>(
    {supabase, table, dispatch, channelName, enabled = true, timeout = 1000}: {
        supabase: SupabaseClient<Database>,
        table: K,
        dispatch: Dispatch<any>,
        channelName: string,
        enabled: boolean,
        timeout: number
    }
) => {
    useEffect(() => {
        if (!enabled) return;
        const channel = supabase.channel(channelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table
            }, (payload: RealtimePostgresInsertPayload<Tables<K>>
                | RealtimePostgresUpdatePayload<Tables<K>>
                | RealtimePostgresDeletePayload<Tables<K>>
            ) => {
                if (payload.eventType === 'INSERT') {
                    dispatch(insertItemPostgresAction(table, payload));
                } else if (payload.eventType === 'UPDATE') {
                    dispatch(updateItemPostgresAction(table, payload));
                } else if (payload.eventType === 'DELETE') {
                    dispatch(deleteItemPostgresAction(table, payload));
                }
            })
            .subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`, err?: Error) => {
                    dispatch({
                        type: `${ACTION_TYPES.REALTIME_SUBSCRIBE_CALLBACK}`,
                        table,
                        payload: {
                            status,
                            error: err
                        }
                    });
                }
            );

        return () => {
            channel.unsubscribe().then(() => console.log('Unsubscribed from channel'));
        }
    }, [table, dispatch, channelName, timeout, enabled, supabase]);
};


export const combineDispatch = (...dispatches: Dispatch<any>[]) => (action: any) =>
    dispatches.forEach((dispatch) => dispatch(action));

export const combineState = (...states: any[]) => states.reduce((acc, state) => ({...acc, ...state}), {});

/// How to combine types:
// // Example:
// //     const [s1, d1] = useReducer(a, {}); // some init state {}
// // const [s2, d2] = useReducer(b, {}); // some init state {}
// //
// // // don't forget to memoize again


// Example:
//     const [s1, d1] = useReducer(a, {}); // some init state {}
// const [s2, d2] = useReducer(b, {}); // some init state {}
//
// // don't forget to memoize again
// const combinedDispatch = React.useCallback(combineDispatch(d1, d2), [d1, d2]);
// const combinedState = React.useMemo(() => ({ s1, s2, }), [s1, s2]);

export default tableReducer;