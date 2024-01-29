import SignupForm from "@/app/(auth)/sign-up/sign-up";
import {Card, CardHeader, CardContent} from "@/components/ui/card";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import ShortUniqueId from "short-unique-id";
import NotFound from "next/dist/client/components/not-found-error";
import {notFound} from "next/navigation";
import {invitationsQuery, makeInvitationsQuery} from "@/types/queries";
import ErrorPage from "@/components/error-page";
import React from "react";
import supabase from "@/supabase";
import {cookies} from "next/headers";

// export const revalidate = 60

// export async function generateStaticParams() {
//     const response = await makeInvitationsQuery(supabase)
//     const invitations = response.data
//     if (response.error) {
//         throw response.error
//     }
//     if (!invitations) {
//         throw new Error("No invitations found")
//     }
//     return invitations?.map((invitation: any) => {
//         return {
//             code: invitation.stamp_id
//         }
//     })
// }

export const dynamic = 'force-dynamic';


export default async function Page({params}: { params: { stamp: string } }) {
    const supabase = createServerComponentClient({cookies: () => cookies()});
    const response = await makeInvitationsQuery(supabase)
        .eq('stamp_id', params.stamp)
        .single();

    // If the invitation is not found, return a 404
    if (response.error || !response.data) notFound();

    // If the invitation is expired, return a 410
    const uid = new ShortUniqueId();
    const recoveredTimestamp = uid.parseStamp(response.data.stamp_id);
    const isExpired = new Date(recoveredTimestamp).getTime() < new Date().getTime();
    if (isExpired) {
        return (<ErrorPage description={"Sorry, this invitation has expired."}
                           errorCode={"410"}
                           imageUrl={"/404.jpeg"}
                           blurUrl={"/404.jpeg"}
                           className={'absolute inset-0 w-full h-full object-cover bg-gray-100 dark:bg-gray-900'}
                           title={"Gone"}/>)
    }

    // If the invitation is valid, return the sign-up form
    return (
        <>
                <CardHeader className={"text-center text-3xl font-extrabold text-gray-900 dark:text-gray-200"}>
                    Sign up for an account
                </CardHeader>
                <CardContent>
                    <SignupForm stamp={params.stamp}/>
                </CardContent>
        </>
    )
}