import { useState } from "react";
import Image from "next/image";
import { CameraIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tables } from "@/types/supabase";

export function ImageDialog({ item }: { item: Tables<'rescue_buoys'> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="aspect-square cursor-pointer hover:opacity-75 transition-opacity border-none" onClick={() => setIsOpen(true)}>
                    {
                        item?.image_url ? (
                            <div className="aspect-square relative border-none">
                                <Image
                                    src={item.image_url}
                                    alt="Buoy"
                                    layout="fill"
                                    objectFit="cover"
                                    objectPosition="center"
                                    className="aspect-square border-none"
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            </div>
                        ) : (
                            <div className="flex aspect-square w-full items-center justify-center bg-gray-200 dark:bg-gray-800 border-none">
                                <CameraIcon className="h-12 w-12 text-gray-400" aria-hidden="true"/>
                            </div>
                        )
                    }
                </div>
            </DialogTrigger>
            <DialogContent className="p-0 m-0 bg-transparent border-none">
                {
                    isOpen && item?.image_url && (
                        <Image
                            src={item.image_url}
                            alt="Buoy"
                            layout="responsive"
                            width={900}
                            height={500}
                            objectFit="contain"
                            objectPosition="center"
                            className="max-w-full max-h-[80vh] mx-auto my-auto border-none"
                        />
                    )
                }
            </DialogContent>
        </Dialog>
    );
}
