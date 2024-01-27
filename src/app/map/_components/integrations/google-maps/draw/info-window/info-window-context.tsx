import React, {createContext, useState, useRef, ReactNode, useContext, useCallback} from 'react';

type AnchorType = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

interface InfoWindowControlContextType {
    openInfoWindow: (newContent: ReactNode, newAnchor: AnchorType, newId: string | number) => void;
    toggleInfoWindow: (newContent: ReactNode, newAnchor: AnchorType, newId: string | number) => void;
    setContent: (newContent: ReactNode) => void;
    setAnchor: (newAnchor: AnchorType) => void;
    closeInfoWindow: () => void;
}

interface InfoWindowStateContextType {
    content: ReactNode;
    anchor: AnchorType | null;
    infoWindowRef: React.RefObject<google.maps.InfoWindow>;
}

const InfoWindowControlContext = createContext<InfoWindowControlContextType | null>(null);
const InfoWindowStateContext = createContext<InfoWindowStateContextType | null>(null);

export const InfoWindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<ReactNode>(null);
    const [anchor, setAnchor] = useState<AnchorType | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow>(new google.maps.InfoWindow());
    const currentIdRef = useRef<string | number | null>(null);

    const openInfoWindow = useCallback((newContent: ReactNode, newAnchor: AnchorType, newId: string | number) => {
        setContent(newContent);
        setAnchor(newAnchor);
        currentIdRef.current = newId;
    }, []);

    const closeInfoWindow = useCallback(() => {
        setContent(null);
        setAnchor(null);
        currentIdRef.current = null;
    }, []);

    const toggleInfoWindow = useCallback((newContent: ReactNode, newAnchor: AnchorType, newId: string | number) => {
        // Use the current value from the ref
        if (currentIdRef.current === newId) {
            // If it's the same anchor, close the InfoWindow
            setContent(null);
            setAnchor(null);
            currentIdRef.current = null;
        } else {
            // If it's a different anchor, open the InfoWindow with the new content
            setContent(newContent);
            setAnchor(newAnchor);
            currentIdRef.current = newId;
        }
    }, []);

    // Expose the current id for consumers if needed
    const currentId = currentIdRef.current;

    return (
        <InfoWindowControlContext.Provider value={{ openInfoWindow, closeInfoWindow, toggleInfoWindow, setContent, setAnchor }}>
            <InfoWindowStateContext.Provider value={{ content, anchor, infoWindowRef }}>
                {children}
            </InfoWindowStateContext.Provider>
        </InfoWindowControlContext.Provider>
    );
};

export const useInfoWindowControlContext = (): InfoWindowControlContextType => {
    const context = useContext(InfoWindowControlContext);
    if (!context) {
        throw new Error('useInfoWindowControlContext must be used within an InfoWindowProvider');
    }
    return context;
};

export const useInfoWindowStateContext = (): InfoWindowStateContextType => {
    const context = useContext(InfoWindowStateContext);
    if (!context) {
        throw new Error('useInfoWindowStateContext must be used within an InfoWindowProvider');
    }
    return context;
};
