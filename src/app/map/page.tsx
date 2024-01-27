import Map from "@/app/map/map";
import supabase, {Tables} from "@/supabase";
import type {Metadata} from "next";

export const revalidate = 60

export const metadata: Metadata = {
    title: 'Pink Rescue Buoys | NSRI',
    description: 'Innovative solution for sea rescue operations.',
}

export default async function Page() {
    // const data = await fetch(`${getBaseUrl()}/api/prb`, {method: 'GET'})
    //     .then(r => r.json())
    //     .catch(e => console.error(e));
    // console.log(data)

    const {data: rescue_buoys, error: e1} = await supabase
        .from("rescue_buoys")
        .select()
        .neq('status', 'UNKNOWN')
        .returns<Tables<`rescue_buoys`>[]>();

    // console.log(rescue_buoys)

    const {data: nsri_stations, error: e2} = await supabase
        .from("nsri_stations")
        .select()
        .returns<Tables<`nsri_stations`>[]>();

    // const data = [
    //     ...d1?.map((item) => {
    //         return {...item, show: true, type: 'rescue_buoys' as const}
    //     }) || [],
    //     ...d2?.map((item) => {
    //         return {...item, show: true, type: 'nsri_stations' as const}
    //     }) || []
    // ].map((item) => {
    //     return {...item, show: true}
    // }).sort((a, b) => b.lat - a.lat);


    return (<>
        <Map serverData={{
            rescue_buoys: rescue_buoys ?? [],
            nsri_stations: nsri_stations ?? []
        }}/>
    </>)
}