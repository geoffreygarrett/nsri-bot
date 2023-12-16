import {useCallback, useState} from 'react';
import {
    MapPinIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CameraIcon,
    QrCodeIcon,
    ChatBubbleBottomCenterIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import {EquipmentStatus, DataType} from '@/components/types'
import {getQRCodeURL} from "@/code/get_qr_code_url";
import createWhatsappLink from "@/code/create_whatsapp_link";
import {DocumentIcon, InformationCircleIcon} from "@heroicons/react/20/solid";
import {redirect} from "next/navigation";


const ItemInfoWindowContent = ({activeItem, sendMessage}: { activeItem: any, sendMessage: any }) => {

    const qr_bgcolor = ''
    const qr_color = '0-0-80'

    const [status, setStatus] = useState(activeItem?.status);
    // const handleStatusChange = (newStatus) => {
    //     setStatus(newStatus);
    //     // Integrate with the status update logic
    // }

    const [description, setDescription] = useState(activeItem?.description);


    // const wrappedHandleStatusChange = (newStatus) => {
    //     handleStatusChange(newStatus);
    //     const formattedMessage = `*Buoy ${activeItem?.name}*\nStatus Changed: ${newStatus}`;
    //     sendMessage(formattedMessage, "+31646275883").then(r => console.log(r));
    // }

    // const StatusButton = ({targetStatus, color, children}) => (
    //     <button
    //         onClick={() => wrappedHandleStatusChange(targetStatus)}
    //         className={`flex-1 flex items-center justify-center bg-${color}-400 hover:bg-${color}-500 text-white font-bold py-2 px-3 rounded ${
    //             status === targetStatus ? `bg-${color}-700` : ''
    //         }`}
    //     >
    //         {children}
    //     </button>
    // );


    const [showQRCode, setShowQRCode] = useState(false);

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };


    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-[250px] md:w-[300px]">

            {/*/!* Image region, must remain square, based on fixed width *!/*/}
            {/*<div className="relative w-full" style={{paddingTop: '100%'}}> /!* Padding-top 100% for 1:1 aspect ratio *!/*/}
            {/*    {activeItem?.image_src ? (*/}
            {/*        <Image*/}
            {/*            src={activeItem.image_src}*/}
            {/*            alt="Buoy"*/}
            {/*            layout="fill"*/}
            {/*            objectFit="cover"*/}
            {/*            className="absolute top-0 left-0 w-full h-full object-cover"*/}
            {/*        />*/}
            {/*    ) : (*/}
            {/*        <div*/}
            {/*            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-200">*/}
            {/*            <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}


            {/* Image/QR Code region, must remain square, based on fixed width */}
            <div className="relative w-full" style={{paddingTop: '100%'}}> {/* Padding-top 100% for 1:1 aspect ratio */}
                {showQRCode ? (
                    <div
                        className={`absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center transition-opacity duration-500 ${showQRCode ? 'opacity-100' : 'opacity-0'}`}>
                        <Image
                            src={getQRCodeURL({
                                data: createWhatsappLink(`\*[${activeItem?.id}]\*\n`),
                                size: 100,
                                margin: 0,
                                format: 'svg',
                                bgcolor: qr_bgcolor,
                                color: qr_color,
                            })}
                            alt="QR Code"
                            width={100}
                            height={100}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                ) : activeItem?.image_src ? (
                    <Image
                        src={activeItem.image_src}
                        alt="Buoy"
                        layout="fill"
                        objectFit="cover"
                        className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-200">
                        <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>
                    </div>
                )}
            </div>

            {/* Details region */}
            <div className="px-4 pt-4">
                <h3 className="text-lg font-semibold leading-7 text-gray-900">{activeItem?.name}</h3>
                {activeItem?.address && (
                    <p className="mt-1 text-sm leading-6 text-gray-500">{activeItem.address}</p>
                )}
                {/*<p className="mt-1 text-sm leading-6 text-gray-500">Details and status of the buoy.</p>*/}
            </div>


            {/*/!*QR CODE*!/*/}
            {/*<div className="">*/}
            {/*    <Image*/}
            {/*        src={getQRCodeURL({*/}
            {/*            data: createWhatsappLink(`\*[${activeItem?.id}]\*\n`),*/}
            {/*            size: 100,*/}
            {/*            margin: 0,*/}
            {/*            format: 'svg',*/}
            {/*            bgcolor: qr_bgcolor,*/}
            {/*            color: qr_color,*/}
            {/*        })}*/}
            {/*        alt="QR Code"*/}
            {/*        width={100}*/}
            {/*        height={100}*/}
            {/*        className="w-full h-auto object-cover"*/}
            {/*    />*/}
            {/*</div>*/}

            {/* Button region */}
            <div className="flex justify-around p-2">
                <button
                    type="button"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                    aria-label="QR Code"
                    onClick={toggleQRCode}
                >
                    <QrCodeIcon className="h-6 w-6 text-gray-600"/>
                </button>
                <button
                    type="button"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                    aria-label="WhatsApp"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.open(createWhatsappLink(`\*[${activeItem?.id}]\*\n`), '_blank');
                        }
                    }}
                >
                    <ChatBubbleBottomCenterIcon className="h-6 w-6 text-gray-600"/>
                </button>
                <button
                    type="button"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                    aria-label="Details"
                >
                    <InformationCircleIcon className="h-6 w-6 text-gray-600"/>
                </button>
                <button
                    type="button"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                    aria-label="Log"
                >
                    <DocumentIcon className="h-6 w-6 text-gray-600"/>
                </button>
            </div>

            {/*<div className="mt-6 border-t border-gray-100">*/}
            {/*    <dl className="divide-y divide-gray-100">*/}
            {/*        /!* Coordinates Section *!/*/}
            {/*        {activeItem?.type === DataType.MARKER && (*/}
            {/*            <div className="px-4 py-6 grid grid-cols-3 gap-4">*/}
            {/*                <dt className="text-sm font-medium text-gray-900">Coordinates</dt>*/}
            {/*                <dd className="mt-1 text-sm text-gray-700 col-span-2 mt-0">*/}
            {/*                    <a href={`https://www.google.com/maps/search/?api=1&query=${activeItem?.lat},${activeItem?.lng}`}*/}
            {/*                       className="flex items-center"*/}
            {/*                       target="_blank" rel="noopener noreferrer">*/}
            {/*                        <MapPinIcon className="h-5 w-5 text-red-600 mr-2"/>*/}
            {/*                        {activeItem?.lat.toFixed(4)}, {activeItem?.lng.toFixed(4)}*/}
            {/*                    </a>*/}
            {/*                </dd>*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*        /!* Status Section *!/*/}
            {/*        <div className="px-4 py-6 grid grid-cols-3 gap-4">*/}
            {/*            <dt className="text-sm font-medium text-gray-900">Status</dt>*/}
            {/*            <dd className="mt-1 text-sm text-gray-700 col-span-2 mt-0">*/}
            {/*                <strong*/}
            {/*                    className={`font-semibold ${status === EquipmentStatus.OK ? 'text-green-500' : 'text-red-500'}`}>{status}</strong>*/}
            {/*            </dd>*/}
            {/*        </div>*/}
            {/*        /!* ID Section *!/*/}
            {/*        {activeItem?.id && (*/}
            {/*            <div className="px-4 py-6 grid grid-cols-3 gap-4">*/}
            {/*                <dt className="text-sm font-medium text-gray-900">ID</dt>*/}
            {/*                <dd className="mt-1 text-sm text-gray-700 col-span-2 mt-0">{activeItem.id}</dd>*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*        /!* Additional sections can be added here *!/*/}
            {/*    </dl>*/}
            {/*</div>*/}


            {/* Status Buttons */}
            {/*<div className="flex divide-x divide-gray-300 bg-gray-100">*/}
            {/*    <StatusButton targetStatus={EquipmentStatus.OK} color="green">*/}
            {/*        <CheckCircleIcon className="h-6 w-6 mr-2"/>*/}
            {/*        Report OK*/}
            {/*    </StatusButton>*/}
            {/*    <StatusButton targetStatus={EquipmentStatus.MISSING} color="red">*/}
            {/*        <ExclamationCircleIcon className="h-6 w-6 mr-2"/>*/}
            {/*        Report Missing*/}
            {/*    </StatusButton>*/}
            {/*</div>*/}
        </div>
    );
};

export default ItemInfoWindowContent;
