"use client";

import {Fragment, useState} from 'react';
import {Disclosure} from '@headlessui/react';
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline';
import Image from "next/image";
import {useTheme} from 'next-themes';
import {ThemeSwitcher} from "@/components/layout/theme-switcher";
import {cn} from "@/lib/utils";
import Link from 'next/link';

// Define the type for navigation items
interface NavItem {
    name: string;
    href: string;
    current: boolean;
}

const navigation: NavItem[] = [
    {name: 'Home', href: '/', current: false},
    {name: 'Map', href: '/map', current: false},
    // Populate with navigation items
];


import {UserIcon} from "@heroicons/react/24/solid";
import Avatar from "@/components/avatar/avatar";
import {AvatarMenu} from "@/components/avatar/avatar-menu";
import {router} from "next/client";
import {usePathname, useRouter} from "next/navigation";
// import {useSupabase} from "@/app/supabase-provider";
import {toast} from "sonner";
import {useUser, useSupabaseClient} from "@supabase/auth-helpers-react";
import {glassEffect, INVITE_PATH, PROFILE_PATH, SIGN_IN_PATH} from "@/constants";

export default function Navbar({className}: { className?: string }) {
    const {theme, setTheme} = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const user = useUser();

    // Function to toggle theme
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const router = useRouter();
    const pathname = usePathname();
    const supabase = useSupabaseClient();
    const avatarActions = user ? [
        {
            label: "Profile",
            action: () => {
                router.push(PROFILE_PATH);
            },
        },
        {
            label: "Invite",
            action: () => {
                router.push(INVITE_PATH);
            },
        },
        {
            label: "Logout",
            action: async () => {
                const {error} = await supabase.auth.signOut();
                router.refresh();
                if (!error) {
                    toast.success("Logged out successfully");
                    router.push(SIGN_IN_PATH);

                } else {
                    toast.error("Logout failed");
                    console.error("Logout failed: ", error);
                }
            },
            topSeparator: true
        },
    ] : [
        {
            label: "Login",
            action: () => {
                const params = new URLSearchParams();
                params.append("redirectTo", pathname);
                router.push(`${SIGN_IN_PATH}?${params.toString()}`);
            },
            // bottomSeparator: true
        },
        // {
        //     label: "Sign Up",
        //     action: () => {
        //         router.push("/sign-up");
        //     },
        // },
    ];


    return (
        <Disclosure as="nav"
            // className={cn("bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 border-1", className)}>
                    className={cn(
                        // "border-b border-gray-200 dark:border-gray-800 border-1",
                        className,
                        // "bg-white bg-opacity-20 rounded drop-shadow-lg z-40", glassEffect,
                        "sticky top-0 z-40"
                    )}>
            {({open}) => (
                <>
                    <div className="mx-auto max-w-7xl px-1 sm:px-1 lg:px-8">
                        <div className="relative flex h-[3rem] items-center justify-between">
                            {/* Mobile menu button */}
                            {navigation.length > 0 && (
                                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                    <Disclosure.Button
                                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? <XMarkIcon className="block h-6 w-6" aria-hidden="true"/> :
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>}
                                    </Disclosure.Button>
                                </div>
                            )}

                            {/* Logo or title */}
                            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/public">
                                        <Image src="/nsri-logo.svg" alt="NSRI Logo" width={40} height={40}
                                               className="pr-2 z-50"/>
                                    </Link>
                                </div>

                                {/* Navigation Links */}
                                <div className="hidden sm:block sm:ml-6">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`${item.current ? 'bg-gray-900 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-700 hover:text-white'} px-3 py-2 rounded-md text-sm font-medium`}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                {/*<div className="sm:items-stretch sm:justify-start">*/}
                                <div
                                    // className="absolute inset-y-0 right-0 flex items-center pr-1 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                    className="relative">
                                    <ThemeSwitcher/>
                                </div>

                                {/* Theme Switcher */}
                                <div className="relative ml-3">
                                    <AvatarMenu items={avatarActions}>
                                        <Avatar/>
                                    </AvatarMenu>
                                </div>


                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <Disclosure.Panel className="sm:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={`${item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
