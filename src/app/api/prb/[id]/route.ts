import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {Database, Tables} from "@/types/supabase";
import {cookies} from "next/headers";
import {NextRequest} from "next/server";


export async function GET(request: NextRequest, {params}: { params: { id: string } }) {
    // Create Supabase client
    const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});


    // Get request body
    const {data, error} = await supabase
        .from(`rescue_buoys`)
        .select("*")
        .eq("id", params.id)
        .returns<Tables<`rescue_buoys`>[]>()
        .single();

    if (error) {
        return new Response(`Supabase error: ${error.message} [${error.code}]`, {status: 500})
    }

    // Return response
    return new Response(JSON.stringify(data, null, 2), {status: 200, headers: {'Content-Type': 'application/json'}});
}