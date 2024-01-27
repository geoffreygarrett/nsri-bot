import React, {createContext, useState, useContext, useCallback, PropsWithChildren} from 'react';
import {InfoWindowProps} from "@/components/map-features/info-window";


const InfoWindowContext = createContext<{
    infoWindowData: Record<string, any> | null;
    infoWindowProps: PropsWithChildren<InfoWindowProps> | null;
    openInfoWindow: (props: PropsWithChildren<InfoWindowProps>, data: Record<string, any> | null) => void;
    closeInfoWindow: () => void;
    toggleInfoWindow: (props: PropsWithChildren<InfoWindowProps>, data: Record<string, any> | null) => void;
    setInfoWindowData: (data: Record<string, any> | null) => void;
}>({
    infoWindowData: null,
    infoWindowProps: null,
    openInfoWindow: (props: PropsWithChildren<InfoWindowProps>, data: Record<string, any> | null) => {
    },
    closeInfoWindow: () => {
    },
    toggleInfoWindow: (props: PropsWithChildren<InfoWindowProps>, data: Record<string, any> | null) => {

    },
    setInfoWindowData: (data: Record<string, any> | null) => {

    }
});


export const useInfoWindowContext = () => useContext(InfoWindowContext);

export const InfoWindowProvider = ({children: children}: { children: React.ReactNode }) => {
    const [infoWindowProps, setInfoWindowProps] = useState<PropsWithChildren<InfoWindowProps> | null>(null);
    const [infoWindowOpen, setIsInfoWindowOpen] = useState<boolean>(false);
    const [infoWindowData, setInfoWindowData] = useState<Record<string, any> | null>(null);

    const openInfoWindow = useCallback((props: PropsWithChildren<InfoWindowProps>, data: Record<string, any> | null) => {
        setIsInfoWindowOpen(true);
        setInfoWindowProps(props);
        setInfoWindowData(data);
    }, []);

    const closeInfoWindow = useCallback(() => {
        setIsInfoWindowOpen(false);
        setInfoWindowProps(null);
        setInfoWindowData(null);
    }, []);

    const toggleInfoWindow = useCallback((props: PropsWithChildren<InfoWindowProps>, data: Record<string, any> | null) => {
        if (infoWindowOpen) {
            closeInfoWindow();
        } else {
            openInfoWindow(props, data);
        }
    }, [infoWindowOpen, openInfoWindow, closeInfoWindow]);

    return (
        <InfoWindowContext.Provider value={{
            infoWindowProps,
            openInfoWindow,
            closeInfoWindow,
            toggleInfoWindow,
            infoWindowData,
            setInfoWindowData
        }}>
            {children}
        </InfoWindowContext.Provider>
    );
};
