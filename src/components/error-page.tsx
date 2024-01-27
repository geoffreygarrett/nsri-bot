import Image from "next/image";
import React from "react";
import Link from "next/link";
import createWhatsappLink from "@/code/create_whatsapp_link";
import {cn} from "@/lib/utils";

// Reusable ErrorPage Component
const ErrorPage = ({errorCode, title, description, imageUrl, blurUrl, className}: {
    errorCode: string,
    title: string,
    description: string,
    imageUrl: string,
    blurUrl: string,
    className?: string
}) => {
    return (
        <div className={cn("absolute flex h-[calc(100dvh-3rem)] w-full items-center justify-center", className)}>
            <div className="text-center z-10">
                {/* Background image */}
                <div className="absolute w-full h-full top-0 left-0 -z-40 bg-cover bg-center dark:bg-black bg-white">
                    <div className="absolute top-0 left-0 w-full h-full dark:opacity-40 opacity-60 pointer-events-none">
                        <Image src={imageUrl}
                               layout='fill'
                               objectFit='cover'
                               alt={errorCode}
                               placeholder='blur'
                               blurDataURL={blurUrl}/>
                    </div>
                    <div
                        className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white dark:from-black to-transparent"></div>
                </div>
                <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">{errorCode}</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-400 sm:text-5xl">
                    {title}
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-700 dark:text-gray-200">
                    {description}
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/"
                          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Go back home
                    </Link>
                    <Link href={`${createWhatsappLink('', "+31646275883")}`}
                          className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                        Contact support <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;