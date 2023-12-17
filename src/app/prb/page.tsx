import Map from "@/components/map";
import supabase, {Tables} from "@/supabase";


const RESCUE_BUOY_TABLE_NAME = process.env.RESCUE_BUOY_TABLE_NAME || 'rescue_buoy';


export default async function Page() {
    const {data, error} = await supabase.from(
        RESCUE_BUOY_TABLE_NAME
    ).select().returns<Tables<'rescue_buoy'>[]>()

    return (<>
        <Map data={data || []}/>
    </>)
}