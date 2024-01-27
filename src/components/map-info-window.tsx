import {useCallback, useEffect, useState} from 'react';
import {
    MapPinIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CameraIcon,
    QrCodeIcon,
    ChatBubbleBottomCenterIcon, PencilSquareIcon, LockClosedIcon, LockOpenIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import {EquipmentStatus, DataType, IMarker} from '@/components/types'
import createWhatsappLink from "@/code/create_whatsapp_link";
import {DocumentIcon, InformationCircleIcon} from "@heroicons/react/20/solid";
import {redirect} from "next/navigation";
import QRCode from "react-qr-code";
import {cn, formatDMM, formatDMS} from "@/lib/utils";
import {useInfoWindowContext} from "@/app/map/_components/integrations/google-maps/info-window-provider";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {EditRescueBuoyForm} from "@/app/map/_components/forms/rescue-buoy-edit-dialogue";
import {Tables} from "@/types/supabase";
import {usePermission} from "react-permission-role";

// export const ItemInfoWindowContent2 = ({item, marker, locked, onLockClick}: {
//     item: Tables<'rescue_buoys'>,
//     marker: google.maps.marker.AdvancedMarkerElement,
//     locked?: boolean
//     onLockClick?: () => void
// }) => {
//     const {isAuthorized, isLoading} = usePermission();
//
//     const [editAuthorized, setEditAuthorized] = useState(false);
//
//     useEffect(() => {
//         isAuthorized(
//             [`station-admin-${item.station_id}`, 'super-admin'],
//             [`can-edit-buoys-${item.station_id}`]).then((result) => {
//             setEditAuthorized(result);
//             console.log(result);
//         })
//
//     }, [isAuthorized, item.station_id]);
//
//     const [showQRCode, setShowQRCode] = useState(false);
//     // const {infoWindowData} = useInfoWindowContext();
//     // const {activeItem, position} = infoWindowData || {};
//     // const [status, setStatus] = useState(infoWindowData?.activeItem?.status);
//     // const [description, setDescription] = useState(infoWindowData?.activeItem?.description);
//     const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//
//     const toggleQRCode = () => {
//         setShowQRCode(!showQRCode);
//     };
//
//     const formattedMessage = (activeItem: IMarker) => {
//         return `\*[${activeItem?.id}]\*\n`;
//     }
//
//     const handleEditClick = () => {
//         setIsEditDialogOpen(true);
//     };
//
//     const handleCloseEditDialog = () => {
//         setIsEditDialogOpen(false);
//     };
//
//     return (
//         <Card className="w-[250px] md:w-[300px] dark:bg-gray-700 dark:border-gray-700 space-y-8">
//             <EditRescueBuoyForm buoy={item} open={isEditDialogOpen}
//                                 onClose={handleCloseEditDialog}/>
//             <CardContent
//                 className="spacy-y-4 w-[250px] md:w-[300px] m-0 p-0 dark:bg-gray-700 dark:border-gray-700 bg-white rounded-lg overflow-hidden">
//                 <div className="aspect-square">
//                     {
//                         item?.image_url ? (
//                             <div className="aspect-square absolute inset-0">
//                                 <Image
//                                     src={item.image_url}
//                                     alt="Buoy"
//                                     layout="fill"
//                                     objectFit="cover" // Changed from 'contain' to 'cover' for cropping
//                                     objectPosition="center" // Ensures the image is centered
//                                     className="aspect-square"
//                                     onDragStart={(e) => e.preventDefault()}
//                                 />
//                             </div>
//                         ) : (
//                             <div
//                                 className="absolute inset-0 flex aspect-square w-full items-center justify-center bg-gray-200 dark:bg-gray-800">
//                                 <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>
//                             </div>
//                         )
//                     }
//                 </div>
//                 <CardTitle
//                     className={"px-4 pt-4 text-lg font-semibold leading-7 text-lg font-semibold leading-7 text-gray-900"}>
//                     {/*<div className="px-4 pt-4">*/}
//                     {item?.name}
//                     {/*{activeItem?.address && (*/}
//                     {/*    <p className="mt-1 text-sm leading-6 text-gray-500">{activeItem.address}</p>*/}
//                     {/*)}*/}
//                     {/*</div>*/}
//                 </CardTitle>
//                 <CardDescription className={"px-4 pt-4"}>
//                     {marker?.position?.lat && marker?.position?.lng && (
//                         <>
//                             {formatDMS(marker?.position.lat, marker?.position.lng)}
//                         </>
//                     )}
//                 </CardDescription>
//                 {item?.station_id && (
//                     <>
//                         <div className="px-4 pt-4 mt-1 text-sm leading-6 text-gray-500">Station
//                             ID: {item.station_id}</div>
//                     </>
//                 )}
//                 <CardFooter className="flex items-center justify-between p-3 space-x-3">
//                     <Button variant="outline"
//                             className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
//                         <MapPinIcon
//                             className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
//                     </Button>
//                     <Button variant="outline"
//                             disabled={!editAuthorized}
//                             className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800"
//                             onClick={onLockClick}
//                     >
//                         {!locked ? (
//                             <LockOpenIcon
//                                 className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
//                         ) : (
//                             <LockClosedIcon
//                                 className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
//                         )}
//                         {/*<InformationCircleIcon*/}
//                         {/*    className="h-6 w-6 text-gray-600 dark:text-gray-200"/>*/}
//                     </Button>
//                     <Button variant="outline"
//                             className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
//                         <DocumentIcon
//                             className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
//                     </Button>
//                     <Button variant="outline"
//                             className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
//                         <ChatBubbleBottomCenterIcon
//                             className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
//                     </Button>
//                     <Button variant="outline"
//                             disabled={!editAuthorized}
//                             className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
//                         <PencilSquareIcon
//                             onClick={handleEditClick}
//                             className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
//                     </Button>
//                 </CardFooter>
//             </CardContent>
//
//         </Card>
//
//     )
//         ;
// }


export const ItemInfoWindowContent = () => {

    const [showQRCode, setShowQRCode] = useState(false);
    const {infoWindowData} = useInfoWindowContext();
    // const {activeItem, position} = infoWindowData || {};
    const [status, setStatus] = useState(infoWindowData?.activeItem?.status);
    const [description, setDescription] = useState(infoWindowData?.activeItem?.description);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    const formattedMessage = (activeItem: IMarker) => {
        return `\*[${activeItem?.id}]\*\n`;
    }

    const handleEditClick = () => {
        setIsEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
    };

    return (
        <Card className="w-[250px] md:w-[300px] m-0 p-0 dark:bg-gray-700 dark:border-gray-700 space-y-8">
            <EditRescueBuoyForm buoy={infoWindowData?.activeItem} open={isEditDialogOpen}
                                onClose={handleCloseEditDialog}/>
            <CardContent
                className="spacy-y-4 overflow-hidden w-[250px] md:w-[300px] m-0 p-0 dark:bg-gray-700 dark:border-gray-700 bg-white rounded-lg overflow-hidden">
                <CardHeader className="aspect-square">
                    {
                        infoWindowData?.activeItem?.image_url ? (
                            <Image
                                src={infoWindowData?.activeItem.image_url}
                                alt="Buoy"
                                layout="fill"
                                objectFit="cover"
                                className="absolute top-0 inset left-0 w-full h-full aspect-square items-center object-cover"
                            />
                        ) : (
                            <div
                                className="absolute top-0 inset left-0 right-0 bottom-0 flex aspect-square items-center justify-center bg-gray-200 dark:bg-gray-800">
                                <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>
                            </div>
                        )
                    }
                </CardHeader>
                <CardTitle
                    className={"px-4 pt-4 text-lg font-semibold leading-7 text-lg font-semibold leading-7 text-gray-900"}>
                    {/*<div className="px-4 pt-4">*/}
                    {infoWindowData?.activeItem?.name}
                    {/*{activeItem?.address && (*/}
                    {/*    <p className="mt-1 text-sm leading-6 text-gray-500">{activeItem.address}</p>*/}
                    {/*)}*/}
                    {/*</div>*/}
                </CardTitle>
                <CardDescription className={"px-4 pt-4"}>
                    {infoWindowData?.position?.lat && infoWindowData?.position?.lng && (
                        <>
                            {formatDMS(infoWindowData?.position.lat, infoWindowData?.position.lng)}

                        </>
                    )
                    }
                </CardDescription>
                <CardFooter className="flex items-center justify-between p-3 space-x-3">
                    <Button variant="outline"
                            className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                        <MapPinIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                    <Button variant="outline"
                            className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                        <InformationCircleIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                    <Button variant="outline"
                            className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                        <DocumentIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                    <Button variant="outline"
                            className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                        <ChatBubbleBottomCenterIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                    <Button variant="outline"
                            className="flex-1 m-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                        <PencilSquareIcon
                            onClick={handleEditClick}
                            className="h-6 w-6 text-gray-600 dark:text-gray-200"/>
                    </Button>
                </CardFooter>
            </CardContent>

        </Card>
        // <div
        //     className="bg-white rounded-lg overflow-hidden w-[250px] md:w-[300px] m-0 p-0 dark:bg-gray-700 dark:border-gray-700">
        //
        //     {/* Image/QR Code region, must remain square, based on fixed width */}
        //     <div className="relative w-full" style={{paddingTop: '100%'}}> {/* Padding-top 100% for 1:1 aspect ratio */}
        //         {showQRCode ? (
        //             <div
        //                 className={
        //                     cn("absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center transition-opacity duration-500",
        //                         showQRCode ? 'opacity-100' : 'opacity-0',
        //                         "dark:bg-gray-800 dark:text-gray-200")
        //                 }>
        //                 <QRCode
        //                     size={256}
        //                     fgColor={"#282372"}
        //                     style={{height: "auto", maxWidth: "100%", width: "100%"}}
        //                     value={createWhatsappLink(formattedMessage(activeItem))}
        //                     viewBox={`0 0 256 256`}
        //                 />
        //             </div>
        //         ) : activeItem?.image_url ? (
        //             <Image
        //                 src={activeItem.image_url}
        //                 alt="Buoy"
        //                 layout="fill"
        //                 objectFit="cover"
        //                 className="absolute top-0 left-0 w-full h-full object-cover"
        //             />
        //         ) : (
        //             <div
        //                 className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
        //                 <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>
        //             </div>
        //         )}
        //     </div>
        //     <div className="p-3">
        //         {/* Status region */}
        //         {position?.lat && position?.lng && (
        //
        //             <div className="px-4 pt-4">
        //                 {formatDMS(position.lat, position.lng)}
        //             </div>
        //         )
        //         }
        //
        //         {/* Details region */}
        //         <div className="px-4 pt-4">
        //             <h3 className="text-lg font-semibold leading-7 text-gray-900">{activeItem?.name}</h3>
        //             {activeItem?.address && (
        //                 <p className="mt-1 text-sm leading-6 text-gray-500">{activeItem.address}</p>
        //             )}
        //             {/*<p className="mt-1 text-sm leading-6 text-gray-500">Details and status of the buoy.</p>*/}
        //         </div>
        //
        //         {/* Button region */}
        //         <div className="flex justify-around p-2">
        //             <button
        //                 type="button"
        //                 className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        //                 aria-label="QR Code"
        //                 onClick={toggleQRCode}
        //             >
        //                 <QrCodeIcon className="h-6 w-6 text-gray-600"/>
        //             </button>
        //             <button
        //                 type="button"
        //                 className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        //                 aria-label="WhatsApp"
        //                 onClick={() => {
        //                     if (typeof window !== 'undefined') {
        //                         window.open(createWhatsappLink(formattedMessage(activeItem)), '_blank');
        //                     }
        //                 }}
        //             ><ChatBubbleBottomCenterIcon className="h-6 w-6 text-gray-600"/>
        //             </button>
        //             <button
        //                 type="button"
        //                 className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        //                 aria-label="Details"
        //             >
        //                 <InformationCircleIcon className="h-6 w-6 text-gray-600"/>
        //             </button>
        //             <button
        //                 type="button"
        //                 className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        //                 aria-label="Log"
        //             >
        //                 <DocumentIcon className="h-6 w-6 text-gray-600"/>
        //             </button>
        //         </div>
        //     </div>
        // </div>
    )
        ;
};



