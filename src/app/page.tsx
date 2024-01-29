import createWhatsappLink from "@/code/create_whatsapp_link";
import LinksGrid from "@/components/links_grid";
import Image from "next/image";
import React from "react";


// Project Description component
const ProjectDescription = ({children}: { children: React.ReactNode }) => (
    <section
        className="my-8 p-6 border rounded-lg shadow-lg lg:max-w-5xl lg:w-full border-opacity-50 border-gray-300 dark:border-neutral-700">
        {children}
    </section>
);

// Header component
const Header = ({children}: { children: React.ReactNode }) => (
    <header className="flex flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-6xl font-bold">
            {children}
        </h1>
    </header>
);

// Home page component
export default function Home() {
    return (
        // <main className="flex h-auto flex-col items-center justify-between p-5 md:p-24">
        <div className="p-5 md:p-24 flex h-full flex-col items-center justify-between">

            {/* Background image */}
            <div className="absolute w-full h-full top-0 left-0 -z-40">
                {/* Absolute positioned image */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <Image src={'/404.jpeg'}
                           layout='fill'
                           objectFit='cover'
                           alt={'404'}
                           placeholder='blur'
                           blurDataURL={'/404.jpeg'}/>
                </div>

                {/* Gradient overlay */}
                <div
                    className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t bg-primary-fade to-transparent"></div>
            </div>

            {/* Header */}
            <Header>
                {/*Welcome to the{' '}*/}
                <div className="flex items-center justify-start text-blue-600 dark:text-blue-400 hover:underline pt-10">
                    {/* Logo */}
                    <Image src="/nsri-logo.svg" alt="NSRI Logo" width={80} height={80} className={"pr-2 z-50"}/>

                    {/* Text */}
                    <a href="https://github.com/geoffreygarrett/nsri-bot" className="ml-3 z-50">
                        NSRI Bot
                    </a>
                </div>
            </Header>


            {/* Project Description */}
            <ProjectDescription>
                <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    Project Overview
                </h2>
                <p className="md:text-lg">
                    The NSRI Bot is an innovative solution designed to assist in sea rescue operations
                    along the South African coast. Utilizing advanced technologies, it provides timely
                    and accurate support for maritime safety, helping to coordinate the location, repair,
                    and replacement of rescue lifebuoys.
                </p>
            </ProjectDescription>

            {/* Links grid */}
            <LinksGrid links={
                [
                    {
                        href: "https://github.com/geoffreygarrett/nsri-bot",
                        title: "GitHub",
                        description: "The source code for this project is open source and available on GitHub."
                    },
                    {
                        href: "https://www.nsri.org.za/",
                        title: "NSRI",
                        description: "The NSRI is a volunteer organisation that saves lives on South African waters."
                    },
                    {
                        href: `${createWhatsappLink('', "+31646275883")}`,
                        title: "Contact Me",
                        description: "Contact me on WhatsApp to discuss this project."
                    },
                    {
                        href: "/map",
                        title: "Pink Rescue Buoys",
                        description: "Map of pink lifebuoys in the Overberg region."
                    }
                ]
            }/>

            {/* Disclaimer Section */}
            <footer
                className="mt-12 text-center text-sm lg:max-w-5xl lg:w-full opacity-30 border-t border-opacity-30 pt-5">
                <p>
                    DISCLAIMER: The NSRI Bot project is an independent effort and is not currently
                    associated with the main head office of the National Sea Rescue Institute (NSRI) at this time.
                    This volunteer work is a part of the shore control group at Station 42. The information
                    and activities of this project are not officially endorsed by NSRI.
                </p>
            </footer>
        </div>
    )
}
