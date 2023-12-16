export const enum EquipmentStatus {
    OK = 'OK',
    MISSING = 'MISSING',
    PROPOSED = 'PROPOSED',
    USED = 'USED',
    MAINTENANCE = 'MAINTENANCE',
}


export type IMarker = {
    id: string;
    name: string;
    lng: number;
    lat: number;
    status: EquipmentStatus;
    last_checked?: string;
    description?: string;
};

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