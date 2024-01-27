import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {Database, Tables} from "@/types/supabase";
import {cookies} from "next/headers";

// Endpoint for sending messages from whatsapp using NSRI numbers (signal and alert)
export async function POST(request: NextRequest) {

    // Create Supabase client
    const supabase =
        createRouteHandlerClient<Database>({cookies});

    // Get request body
    const body = await request.body;


}


export async function GET(request: NextRequest) {

    // Create Supabase client
    const supabase =
        createRouteHandlerClient<Database>({cookies});

    // Get request body
    const {data, error} = await supabase
        .from(`rescue_buoys`)
        .select("*")
        .returns<Tables<`rescue_buoys`>[]>();

    // Return error response
    if (error) {
        return new NextResponse(`Supabase error: ${error.message} [${error.code}]`, {status: 500})
    }

    // Return response
    return new NextResponse(JSON.stringify(data), {status: 200, headers: {'Content-Type': 'application/json'}});
}