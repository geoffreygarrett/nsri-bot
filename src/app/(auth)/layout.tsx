import React from "react";
import {Card} from "@/components/ui/card";
import {cn} from "@/lib/utils";


export default async function AuthLayout({children}: {
    children: React.ReactNode
}) {

    return (
        <>
            <Card className={cn(
                "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700",
                "rounded shadow-md border w-full max-w-md m-auto",
                // "dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
                "sm:p-6 pt-2 p-0 mt-0 sm:mt-8")}>
                {children}
            </Card>
        </>
    )
}