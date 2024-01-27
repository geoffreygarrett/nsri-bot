interface Geometry {
    type: string;
    coordinates: number[] | number[][] | number[][][];
    crs?: {
        type: string;
        properties: {
            name: string;
        };
    };
};

export interface Point extends Geometry {
    type: string;
    coordinates: number[];
};
