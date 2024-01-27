"use client";

import {Avatar as BaseAvatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {UserIcon} from "@heroicons/react/24/solid";
import {useEffect, useState} from "react";
import {User} from "@supabase/auth-helpers-nextjs";
import {useSupabaseClient, useUser} from "@supabase/auth-helpers-react";
import {formatPhoneNumberIntl} from "react-phone-number-input";
import {glassEffect, noGlassEffect} from "@/constants";

export default function Avatar() {
    const user = useUser();
    const avatarUrl = user?.user_metadata?.avatar_url || "https://github.com/geoffreygarrett.png"; // Default avatar URL
    const fullName = user?.user_metadata?.full_name || "User"; // Default user full name
    const initials = user?.user_metadata?.first_name?.charAt(0) + user?.user_metadata?.last_name?.charAt(0); // Default user initials
    // const glassEffect = "bg-white bg-opacity-40 backdrop-blur-md rounded drop-shadow-lg dark:bg-opacity-30 border-opacity-30 dark:border-opacity-30";


    return (
        <BaseAvatar>
            {user ? (
                <AvatarImage src={avatarUrl} alt={fullName}/>
            ) : (
                <AvatarImage>
                    {/*<UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true"/>*/}
                </AvatarImage>
            )}
            <AvatarFallback className={
                noGlassEffect
            }>
                {
                    user && initials ? (
                        <p>{initials}</p>
                    ) : (
                        <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true"/>
                    )
                }
            </AvatarFallback>
        </BaseAvatar>
    );
}
