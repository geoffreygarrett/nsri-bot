import {IMarker} from "@/components/types";
import Pin from "@/app/map/_components/integrations/google-maps/draw/pin";
import {Enums} from "@/types/supabase";
import Image from "next/image";
import React from "react";
import {isRescueBuoy} from "@/app/map/map";

const GlyphFunction = ({point, colorFunction}: {
    point: IMarker,
    colorFunction?: (point: IMarker) => { background: string, border: string },
}) => {
    // return your JSX here
    if (isRescueBuoy(point)) {
        return <>
            <Pin
                background={colorFunction?.(point).background || 'rgb(255,126,192)'}
                borderColor={colorFunction?.(point).border || '#9d2d65'}
                scale={1.35}
            >
                <div className="flex items-center justify-center">
                    <div className="text-gray-800 text-xxs items-center justify-center text-center text-bold">
                        {point.status === "UNKNOWN" as Enums<'buoy_status'> && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" color="white"
                                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
                            </svg>
                        )}
                        {point.status !== "UNKNOWN" as Enums<'buoy_status'> && point.buoy_id && point.buoy_id && (
                            [point.station_id, point.buoy_id].map((item: any) => item.toString().replace(/^0+/, "")).join('\n')
                        )}
                    </div>
                </div>
            </Pin>
        </>
    } else {
        return <>
            <Pin scale={1.4} background={'#ffffff'} borderColor={'rgba(61,56,243,0.38)'}>
                <figure className="w-6 h-6 -translate-y-0">
                    <Image src={'/nsri-logo.svg'}
                           layout='fill'
                           objectFit='contain'
                           alt={'NSRI Logo'}
                           placeholder='blur'
                           blurDataURL={'/nsri-logo.svg'}/>
                </figure>
            </Pin>
        </>
    }
}
