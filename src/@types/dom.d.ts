type MapContextmenuInit = {
    lat: number;
    lng: number;
    clientX: number;
    clientY: number;
};


export type MapContextmenuEvent = CustomEvent<MapContextmenuInit>;

export interface CustomEventMap {
    "mapcontextmenu": MapContextmenuEvent;
}

declare global {
    interface Document { //adds definition to Document, but you can do the same with HTMLElement
        addEventListener<K extends keyof CustomEventMap>(type: K,
                                                         listener: (this: Document, ev: CustomEventMap[K]) => void): void;

        dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
    }
}
export {}; //keep that for TS compiler.