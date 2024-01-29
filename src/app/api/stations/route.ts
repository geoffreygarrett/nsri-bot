import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Database, Tables} from "@/types/supabase";
import {cookies} from "next/headers";


export async function GET(request: NextRequest) {

    // Create Supabase client
    const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});


    // Get request body
    const {data, error} = await supabase
        .from(`nsri_stations`)
        .select(`*`);

    // Return error response
    if (error) {
        return new NextResponse(`Supabase error: ${error.message} [${error.code}]`, {status: 500})
    }

    // Return response
    return new NextResponse(JSON.stringify(data), {status: 200, headers: {'Content-Type': 'application/json'}});
}