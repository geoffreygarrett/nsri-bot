"use client";

import React from "react";
// import {QueryClient, QueryClientProvider} from "react-query";

export default function AuthLayout({children}: {
    children: React.ReactNode
}) {
    // const queryClient = new QueryClient();
    return (

        <>
            {/*<QueryClientProvider client={queryClient}>*/}
                {children}
            {/*</QueryClientProvider>*/}
        </>
    )

    // return (
    //     // <div className="flex flex-row justify-center items-stretch gap-4 p-4 min-h-[calc(100vh-3rem)]">
    //         {/*<div className="flex flex-auto min-w-0 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 p-6">*/}
    //         {/*    /!* Column 1 content here *!/*/}
    //         {/*    <div>Column 1 Content</div>*/}
    //         {/*</div>*/}
    //         {/*<div className="flex flex-auto min-w-0 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 p-6 w-[60rem] rounded-lg">*/}
    //             {/* Main column content here */}
    //         // </div>
    //         {/*<div className="flex flex-auto min-w-0 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 p-6">*/}
    //         {/*    /!* Column 3 content here *!/*/}
    //         {/*    <div>Column 3 Content</div>*/}
    //         {/*</div>*/}
    //     // </div>
    // )
}
