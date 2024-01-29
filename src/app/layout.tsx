import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import Link from "next/link";
import React from "react";
import {Toaster} from "@/components/ui/sonner"
import {ThemeProvider} from "@/app/_components/layout/theme-provider";
import {ThemeSwitcher} from "@/app/_components/layout/theme-switcher";
import Navbar from "@/app/_components/layout/navbar";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";

const inter = Inter({subsets: ['latin']})

// Metadata configuration
export const metadata: Metadata = {
    title: 'NSRI App',
    description: 'Innovative technology for sea rescue operations.',
    icons: {
        icon: [
            {url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png'},
            {url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png'}
        ],
        shortcut: ['/favicon.ico'],
        apple: [
            {url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'},
        ],
    },
    manifest: '/site.webmanifest',
    // twitter: {
    //     card: 'summary_large_image',
    //     title: 'NSRI Bot Project',
    //     description: 'Innovative solution for sea rescue operations.',
    //     siteId: 'YourSiteId',
    //     creator: '@YourTwitterHandle',
    //     creatorId: 'YourCreatorId',
    //     images: ['/nsri-logo.png'],
    // },
    // verification: {
    //     google: 'YourGoogleVerificationCode',
    //     yandex: 'YourYandexVerificationCode',
    //     yahoo: 'YourYahooVerificationCode',
    //     other: {
    //         me: ['YourEmail', 'YourLink'],
    //     },
    // },
    // appleWebApp: {
    //     appId: 'YourAppStoreID',
    //     appArgument: 'YourAppArgument',
    //     title: 'NSRI Bot',
    //     statusBarStyle: 'black-translucent',
    //     startupImage: [
    //         '/apple-touch-icon.png',
    //     ],
    // },
};

import {Database} from "@/types/supabase";
import {cookies} from "next/headers";
import AppProviders from "@/app/providers";
import {cn} from "@/lib/utils";
import {glassEffect} from "@/constants";
// const glassEffect = "bg-white bg-opacity-40 backdrop-blur-md rounded drop-shadow-lg dark:bg-opacity-30 border-opacity-30 dark:border-opacity-30";


// const Example = (props) => {
//     const [value, setValue] = useState('');
//
//     useBeforeunload(value !== '' ? (event) => event.preventDefault() : null);
//
//     return (
//         <input onChange={(event) => setValue(event.target.value)} value={value} />
//     );
// };

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
        <body className={inter.className}>
        <AppProviders>
            <Navbar
                className={cn(
                    // "bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 border-1 shadow-sm",
                    glassEffect)}/>
            <main>
                {children}
            </main>
        </AppProviders>
        </body>
        </html>
    )
}
