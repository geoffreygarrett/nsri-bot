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
import {EquipmentStatus, DataType, IMarker} from '@/components/types'
import createWhatsappLink from "@/code/create_whatsapp_link";
import {DocumentIcon, InformationCircleIcon} from "@heroicons/react/20/solid";
import {redirect} from "next/navigation";
import QRCode from "react-qr-code";


const ItemInfoWindowContent = ({activeItem, sendMessage}: { activeItem: any, sendMessage: any }) => {
    const [status, setStatus] = useState(activeItem?.status);
    const [description, setDescription] = useState(activeItem?.description);
    const [showQRCode, setShowQRCode] = useState(false);

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    const formattedMessage = (activeItem: IMarker) => {
        return `\*[${activeItem?.id}]\*\n`;
    }

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-[250px] md:w-[300px]">

            {/* Image/QR Code region, must remain square, based on fixed width */}
            <div className="relative w-full" style={{paddingTop: '100%'}}> {/* Padding-top 100% for 1:1 aspect ratio */}
                {showQRCode ? (
                    <div
                        className={`absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center transition-opacity duration-500 ${showQRCode ? 'opacity-100' : 'opacity-0'}`}>
                        <QRCode
                            size={256}
                            fgColor={"#282372"}
                            style={{height: "auto", maxWidth: "100%", width: "100%"}}
                            value={createWhatsappLink(formattedMessage(activeItem))}
                            viewBox={`0 0 256 256`}
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
                            window.open(createWhatsappLink(formattedMessage(activeItem)), '_blank');
                        }
                    }}
                ><ChatBubbleBottomCenterIcon className="h-6 w-6 text-gray-600"/>
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
        </div>
    );
};

export default ItemInfoWindowContent;
