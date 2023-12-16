// 'use client'

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL

import Map from "@/components/map";
import {sendWhatsApp} from "@/server/send_message";

export default function Page() {

    return (<>
        <Map sendMessage={sendWhatsApp}/>
    </>)
}