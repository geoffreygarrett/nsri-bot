import {promises as fs} from "fs"
import path from "path"
import {Metadata} from "next"
import Image from "next/image"
import {z} from "zod"

import {columns} from "./columns"
import {DataTable} from "../components/data-table"
import {UserNav} from "../components/user-nav"
import {logEndpointSchema} from "./data/schema"
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {cookies} from "next/headers";

// export const metadata: Metadata = {
//     title: "Tasks",
//     description: "A task and issue tracker build using Tanstack Table.",
// }

// Simulate a database read for tasks.
async function getLog() {
    const supabase = createServerComponentClient<Database>({cookies})
    const {data} = await supabase.from('log_endpoint').select('*').order('created_at', {ascending: false})
    if (!data) {
        return []
    }
    // const tasks = JSON.parse(data.toString())
    return z.array(logEndpointSchema).parse(data)
}

export default async function TaskPage() {
    const log = await getLog()

    return (
        <>
            <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        {/*<h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>*/}
                        {/*<p className="text-muted-foreground">*/}
                        {/*    Here&apos;s a list of your tasks for this month!*/}
                        {/*</p>*/}
                    </div>
                    <div className="flex items-center space-x-2">
                        <UserNav/>
                    </div>
                </div>
                <DataTable data={log} columns={columns}/>
            </div>
        </>
    )
}
