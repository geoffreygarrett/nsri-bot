import {Tables} from "@/types/supabase";

export const enum EquipmentStatus {
    OK = 'OK',
    MISSING = 'MISSING',
    PROPOSED = 'PROPOSED',
    USED = 'USED',
    MAINTENANCE = 'MAINTENANCE',
}

export type IMarker = (Tables<`rescue_buoys`> | Tables<`nsri_stations`>) & { show: boolean };

// add property of "show" to IMarker
// export type IMarkerWithShow = IMarker & { show: boolean };

export type IMarkerFolder = {
    [key: string]: IMarker;
};


export type IPolygon = {
    id: string;
    name: string;
    coordinates: [number, number][];
    status: keyof typeof EquipmentStatus;
    last_checked?: Date;
    description?: string;
};

export const DataType = {
    MARKER: 'marker',
    POLYGON: 'polygon',
    // MARKER_FOLDER: 'marker_folder'
};


export type IExport =
    (IMarker & { name?: string, description?: string, image_src?: string }
        // | IMarkerFolder & { name?: string, description?: string }
        | IPolygon & { name?: string, description?: string, image_src?: string }) & { type: keyof typeof DataType };


export const ExportType = {
    KML: 'kml',
    GEOJSON: 'geojson',
    CSV: 'csv'
};