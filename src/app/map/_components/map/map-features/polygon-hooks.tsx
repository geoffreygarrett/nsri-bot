import React, {useCallback, useContext} from "react";
import {Polygon, PolygonPropsAll, usePolygonRef} from "@/app/map/_components/integrations/google-maps/draw/polygon";
import {Tables} from "@/types/supabase";
import {updateItemAction} from "@/store/table-reducer";
import {AppContext} from "@/app/app";

interface PolygonWithHooksProps extends PolygonPropsAll {
    item: Tables<'nsri_stations'>;
}

export const PolygonWithHooks: React.FC<PolygonWithHooksProps> = (props) => {
    const [polygonRef, polygon] = usePolygonRef();
    const {dispatch} = useContext(AppContext);

    const handleStationPolygonInsertAt = useCallback((index: number, _: google.maps.LatLng, item: Tables<'nsri_stations'>) => {
        if (!item.service_area || !polygon) return;

        const path = polygon.getPath();
        const coordinates = path.getArray().map(latlng => [latlng.lng(), latlng.lat()]);

        const updatedServiceArea = {
            ...item.service_area,
            coordinates: [coordinates]
        };

        const updatedItem = {
            ...item,
            service_area: updatedServiceArea,
            updated_at: new Date().toISOString()
        };

        dispatch(updateItemAction('nsri_stations', {column: 'id', value: item.id, data: updatedItem}, 'client'));
    }, [dispatch, polygon]);

    const handleStationPolygonSetAt = useCallback((index: number, _: google.maps.LatLng, item: Tables<'nsri_stations'>) => {
        if (!item.service_area || !polygon) return;

        const path = polygon.getPath();
        const coordinates = path.getArray().map(latlng => [latlng.lng(), latlng.lat()]);

        const updatedServiceArea = {
            ...item.service_area,
            coordinates: [coordinates]
        };

        const updatedItem = {
            ...item,
            service_area: updatedServiceArea,
            updated_at: new Date().toISOString()
        };

        dispatch(updateItemAction('nsri_stations', {column: 'id', value: item.id, data: updatedItem}, 'client'));
    }, [dispatch, polygon]);

    return (
        <Polygon
            ref={polygonRef}
            {...props}
            onInsertAt={(index, obj) => handleStationPolygonInsertAt(index, obj, props.item)}
            onSetAt={(index, obj) => handleStationPolygonSetAt(index, obj, props.item)}
        />
    );
};

export default React.memo(PolygonWithHooks);
