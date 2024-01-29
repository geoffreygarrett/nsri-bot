import {Tables} from "@/types/supabase";
import {cn, formatDMS} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CameraIcon, PencilSquareIcon, XMarkIcon} from "@heroicons/react/24/outline";
import Image from "next/image";
import {ImageDialog} from "@/app/map/_components/map/image";

export const BuoyInfoWindowContent = ({
                                          item,
                                          marker,
                                          data
                                      }: {
    item: Tables<'rescue_buoys'>,
    marker: google.maps.marker.AdvancedMarkerElement,
    data?: Record<string, any> // Make data optional
}) => {
    const getLatLngValues = (lat: number | (() => number), lng: number | (() => number)) => {
        return {
            lat: typeof lat === 'function' ? lat() : lat,
            lng: typeof lng === 'function' ? lng() : lng,
        };
    };
    const glassEffect = cn("opt-blur",
        "bg-white bg-opacity-50 rounded drop-shadow-lg dark:bg-opacity-30 border-opacity-30 dark:border-opacity-30",
        "hover:bg-white hover:bg-opacity-100 hover:backdrop-blur-lg hover:drop-shadow-xl hover:border-opacity-100 hover:dark:bg-opacity-50 hover:dark:backdrop-blur-lg hover:dark:drop-shadow-xl hover:dark:border-opacity-100");

    return (
        <Card className="card bg-white dark:bg-gray-700 w-[250px] md:w-[300px] rounded-lg overflow-hidden shadow-lg">
            <CardContent
                className="spacy-y-4 w-[250px] md:w-[300px] m-0 p-0 dark:bg-gray-700 dark:border-gray-700 bg-white rounded-lg overflow-hidden">
                <div className="absolute top-0 left-0 p-2 z-10 h-10 w-10">
                    <Button onClick={data ? data.onEditClick : undefined}
                            className={cn("m-0 p-0 aspect-square rounded shadow-md transition duration-200 ease-in-out", glassEffect)}>
                        <PencilSquareIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                </div>
                <div className="absolute top-0 right-0 mr-4 p-2 z-10 h-10 w-10">
                    <Button
                        onClick={data ? data.onCloseClick : undefined}
                        className={cn("m-0 p-0 aspect-square rounded shadow-md transition duration-200 ease-in-out", glassEffect)}>
                        <XMarkIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                </div>
                <ImageDialog item={item}/>
                {/*<div className="aspect-square">*/}
                {/*    {*/}
                {/*        item?.image_url ? (*/}
                {/*            <div className="aspect-square absolute inset-0">*/}
                {/*                <Image*/}
                {/*                    src={item.image_url}*/}
                {/*                    alt="Buoy"*/}
                {/*                    layout="fill"*/}
                {/*                    objectFit="cover" // Changed from 'contain' to 'cover' for cropping*/}
                {/*                    objectPosition="center" // Ensures the image is centered*/}
                {/*                    className="aspect-square"*/}
                {/*                    onDragStart={(e) => e.preventDefault()}*/}
                {/*                />*/}
                {/*            </div>*/}
                {/*        ) : (*/}
                {/*            <div*/}
                {/*                className="absolute inset-0 flex aspect-square w-full items-center justify-center bg-gray-200 dark:bg-gray-800">*/}
                {/*                <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>*/}
                {/*            </div>*/}
                {/*        )*/}
                {/*    }*/}
                {/*</div>*/}

                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item?.name}</h3>

                    {marker?.position?.lat && marker?.position?.lng && (
                        <p className="text-sm text-gray-500">
                            {typeof marker?.position?.lat === 'function' && typeof marker?.position?.lng === 'function' ? (
                                <>
                                    {formatDMS(marker.position.lat(), marker.position.lng())}
                                </>
                            ) : (
                                <>
                                    {formatDMS(marker.position.lat as number, marker.position.lng as number)}
                                </>
                            )}
                        </p>
                    )}

                    {item?.station_id && (
                        <p className="text-sm text-gray-500 mt-1">
                            Station ID: {item.station_id}
                        </p>
                    )}
                </div>

            </CardContent>

        </Card>
    );
};

export const StationInfoWindowContent = ({
                                          item,
                                          marker,
                                          data
                                      }: {
    item: Tables<'nsri_stations'>,
    marker: google.maps.marker.AdvancedMarkerElement,
    data?: Record<string, any> // Make data optional
}) => {
    const getLatLngValues = (lat: number | (() => number), lng: number | (() => number)) => {
        return {
            lat: typeof lat === 'function' ? lat() : lat,
            lng: typeof lng === 'function' ? lng() : lng,
        };
    };
    const glassEffect = cn("opt-blur",
        "bg-white bg-opacity-50 rounded drop-shadow-lg dark:bg-opacity-30 border-opacity-30 dark:border-opacity-30",
        "hover:bg-white hover:bg-opacity-100 hover:backdrop-blur-lg hover:drop-shadow-xl hover:border-opacity-100 hover:dark:bg-opacity-50 hover:dark:backdrop-blur-lg hover:dark:drop-shadow-xl hover:dark:border-opacity-100");

    return (
        <Card className="card bg-white dark:bg-gray-700 w-[250px] md:w-[300px] rounded-lg overflow-hidden shadow-lg">
            <CardContent
                className="spacy-y-4 w-[250px] md:w-[300px] m-0 p-0 dark:bg-gray-700 dark:border-gray-700 bg-white rounded-lg overflow-hidden">
                <div className="absolute top-0 left-0 p-2 z-10 h-10 w-10">
                    <Button onClick={data ? data.onEditClick : undefined}
                            className={cn("m-0 p-0 aspect-square rounded shadow-md transition duration-200 ease-in-out", glassEffect)}>
                        <PencilSquareIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                </div>
                <div className="absolute top-0 right-0 mr-4 p-2 z-10 h-10 w-10">
                    <Button
                        onClick={data ? data.onCloseClick : undefined}
                        className={cn("m-0 p-0 aspect-square rounded shadow-md transition duration-200 ease-in-out", glassEffect)}>
                        <XMarkIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                </div>
                <div className="aspect-square">
                    {
                        // item?.image_url ? (
                        //     <div className="aspect-square absolute inset-0">
                        //         <Image
                        //             src={item.image_url}
                        //             alt="Buoy"
                        //             layout="fill"
                        //             objectFit="cover" // Changed from 'contain' to 'cover' for cropping
                        //             objectPosition="center" // Ensures the image is centered
                        //             className="aspect-square"
                        //             onDragStart={(e) => e.preventDefault()}
                        //         />
                        //     </div>
                        // ) : (
                            <div
                                className="absolute inset-0 flex aspect-square w-full items-center justify-center bg-gray-200 dark:bg-gray-800">
                                <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>
                            </div>
                        // )
                    }
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item?.name}</h3>

                    {marker?.position?.lat && marker?.position?.lng && (
                        <p className="text-sm text-gray-500">
                            {typeof marker?.position?.lat === 'function' && typeof marker?.position?.lng === 'function' ? (
                                <>
                                    {formatDMS(marker.position.lat(), marker.position.lng())}
                                </>
                            ) : (
                                <>
                                    {formatDMS(marker.position.lat as number, marker.position.lng as number)}
                                </>
                            )}
                        </p>
                    )}

                    {item?.id && (
                        <p className="text-sm text-gray-500 mt-1">
                            Station ID: {item.id}
                        </p>
                    )}
                </div>

            </CardContent>

        </Card>
    );
};