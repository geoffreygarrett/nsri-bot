import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import Link from "next/link";
import React from "react";

const inter = Inter({subsets: ['latin']})

// Metadata configuration
export const metadata: Metadata = {
    title: 'NSRI Bot',
    description: 'Innovative solution for sea rescue operations.',
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


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}
        </body>
        </html>
    )
}
