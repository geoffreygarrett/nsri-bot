"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Separator} from "@/components/ui/separator"
import {Progress} from "@/components/progress";
import {getBaseUrl} from "@/code/domain";
import {cn, copyToClipboard} from "@/lib/utils";

import {
    UserCircleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    EllipsisHorizontalCircleIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";


import {Skeleton} from "@/components/ui/skeleton";
import ShortUniqueId from "short-unique-id";
import React, {useEffect} from "react";
import {InvitationsQueryType} from "@/types/queries";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {formatPhoneNumberIntl} from "react-phone-number-input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Loader2} from "lucide-react";

export function PersonSkeleton() {
    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
                {/* Skeleton for Avatar */}
                <Skeleton className="h-12 w-12 rounded-full"/>
                {/* Skeleton for Name and Phone */}
                <div>
                    <Skeleton className="h-4 w-[150px]"/> {/* Adjust width as per your layout */}
                    <Skeleton className="h-4 w-[100px]"/>
                </div>
            </div>
            {/* Skeleton for Status Icon */}
            <Skeleton className="h-6 w-6"/>
            {/* Skeleton for Select Box */}
            <div className="ml-auto w-[110px]">
                <Skeleton className="h-8 w-full"/>
            </div>
        </div>
    )
}

export function InvitationCardSkeleton({numberOfPeople, spinner}: { numberOfPeople: number, spinner?: boolean }) {
    return (
        <div className={"relative"}>
            {spinner && (
                <div className="absolute inset-0 flex justify-center items-center z-50">
                    {/*<Loader2 className="animate-spin rounded-full h-10 w-10 border-b-4 border-gray-900"/>*/}
                    <Loader2 className="animate-spin h-14 w-14 stroke-2 z-50" color={"#2dc72d"}/>
                </div>
            )}
            <Card className={cn(spinner ? "blur-sm" : "")}>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2"/> {/* Title Skeleton */}
                    <Skeleton className="h-4 w-full"/> {/* Description Skeleton */}
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-2/3"/> {/* Link Skeleton */}
                        <Skeleton className="h-10 w-1/3"/> {/* Button Skeleton */}
                    </div>
                    <Separator className="my-4"/>
                    <Skeleton className="h-4 w-24 mb-4"/> {/* Subtitle Skeleton */}
                    <div className="space-y-4">
                        {Array.from({length: numberOfPeople}, (_, index) => (
                            <PersonSkeleton key={index}/>
                        ))}
                    </div>
                </CardContent>
                <Progress value={100} className="rounded-lg animate-pulse"/>
                {/*<Skeleton className="h-2 w-full rounded-lg mt-4"/> /!* Progress Bar Skeleton *!/*/}
            </Card>
        </div>
    );
}


const InvitationSent = (message_sent: InvitationsQueryType[0]['messages_sent'][0]) => {

    const [statusIcon, setStatusIcon] = React.useState<React.ReactNode>(<Skeleton className="h-6 w-6"/>);
    const [tooltipText, setTooltipText] = React.useState<string>('');
    const [phoneNumber, setPhoneNumber] = React.useState<string>('');


    useEffect(() => {
        const setAll = async () => {
            const formattedPhoneNumber = formatPhoneNumberIntl(message_sent?.to?.split(':')[1] || '');
            setPhoneNumber(formattedPhoneNumber);
            if (message_sent?.read_at) {
                setStatusIcon(<EyeIcon className="text-blue-500 h-6 w-6"/>);
                setTooltipText(`Seen: ${message_sent?.read_at}\n`);
            } else if (message_sent?.delivered_at) {
                setStatusIcon(<CheckCircleIcon className="text-gray-500 h-6 w-6"/>);
                setTooltipText(`Delivered: ${message_sent?.delivered_at}\n`);
            } else if (message_sent?.sent_at) {
                setStatusIcon(<EllipsisHorizontalCircleIcon className="text-yellow-500 h-6 w-6"/>);
                setTooltipText(`Sent: ${message_sent?.sent_at}`);
            } else {
                setStatusIcon(<ExclamationCircleIcon className="text-red-500 h-6 w-6"/>);
                setTooltipText(`Not Sent`);
            }
        }
        setAll().then(r => r);
    }, [message_sent])

    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    // useEffect so that when clicked, the tooltip is open for a timeout
    useEffect(() => {
        if (tooltipOpen) {
            setTimeout(() => {
                setTooltipOpen(false);
            }, 3000);
        }
    }, [tooltipOpen]);

    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
                <Avatar>
                    {/*{avatar && (*/}
                    {/*    <AvatarImage src={avatar}/>*/}
                    {/*)}*/}
                    {/*<AvatarFallback>{fallback ? fallback : name?.charAt(0).toUpperCase()}</AvatarFallback>*/}
                    <AvatarFallback>{message_sent?.to?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    {/*<p className="text-sm font-medium leading-none">{name}</p>*/}
                    <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                </div>
            </div>
            {/*<Tooltip key={invitationSent.id} open={tooltipOpen}>*/}

            {/* FOR MOUSE DEVICES */}
            <div className="pointer-fine">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col justify-center items-center">
                            <div className="w-full h-full">
                                {statusIcon}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {tooltipText}
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* FOR TOUCH DEVICES */}
            <div className="pointer-coarse">
                <Tooltip open={tooltipOpen}>
                    <TooltipTrigger asChild onClick={() => setTooltipOpen(true)} onFocus={() => setTooltipOpen(true)}>
                        <div className="flex flex-col justify-center items-center">
                            <div className="w-full h-full">
                                {statusIcon}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {tooltipText}
                    </TooltipContent>
                </Tooltip>
            </div>


            <Select defaultValue="edit">
                <SelectTrigger className="ml-auto w-[110px]">
                    <SelectValue placeholder="Select"/>
                </SelectTrigger>
                <SelectContent className="absolute">
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">Can view</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

// const state = {
//     id: "101c65c7-db10-45e0-a784-f43d28c41ab4",
//     created_at: "2021-10-01T00:00:00.000000Z",
//     updated_at: "2021-10-01T00:00:00.000000Z",
//     created_by: {
//         id: "101c65c7-db10-45e0-a784-f43d28c41ab4",
//         phone: "+1 202-555-0179",
//     },
//     invitations_sent: [
//         {phone: "+1 202-555-0179", created_at: "2021-10-01T00:00:00.000000Z"},
//         {phone: "+1 202-555-0179", created_at: "2021-10-01T00:00:00.000000Z"},
//         {phone: "+1 202-555-0179", created_at: "2021-10-01T00:00:00.000000Z"},
//     ],
//     people: [
//         {
//             name: 'Olivia Martin',
//             phone: '+1 202-555-0179',
//             fallback: 'OM',
//             deliveredAt: 'Oct 1, 2021 12:00 AM',
//         },
//         {
//             name: 'Isabella Nguyen',
//             phone: '+1 202-555-0179',
//             fallback: 'IN',
//             deliveredAt: 'Oct 1, 2021 12:00 AM',
//             seenAt: 'Oct 1, 2021 12:00 AM',
//         },
//         {
//             name: 'Sofia Davis',
//             phone: '+1 202-555-0179',
//             fallback: 'SD',
//             deliveredAt: 'Oct 1, 2021 12:00 AM',
//             readAt: 'Oct 1, 2021 12:00 AM',
//             signedUpAt: 'Oct 1, 2021 12:00 AM',
//         }]
//
// }
//
//
// const Person = ({
//                     name,
//                     phone,
//                     avatar,
//                     fallback,
//                     sentAt = '',
//                     deliveredAt = '',
//                     seenAt = '',
//                     signedUpAt = ''
//                 }: {
//     phone: string,
//     name?: string,
//     avatar?: string,
//     fallback?: string,
//     delivered?: boolean,
//     read?: boolean,
//     signedUp?: boolean,
//     sentAt?: string,
//     deliveredAt?: string,
//     seenAt?: string,
//     signedUpAt?: string
// }) => {
//     let statusIcon;
//     let tooltipText = '';
//
//     if (signedUpAt) {
//         statusIcon = <UserCircleIcon className="text-green-500 h-6 w-6"/>;
//         tooltipText += `Signed Up: ${signedUpAt}\n`;
//     } else if (seenAt) {
//         statusIcon = <EyeIcon className="text-blue-500 h-6 w-6"/>;
//         tooltipText += `Seen: ${seenAt}\n`;
//     } else if (deliveredAt) {
//         statusIcon = <CheckCircleIcon className="text-gray-500 h-6 w-6"/>;
//         tooltipText += `Delivered: ${deliveredAt}\n`;
//     } else if (sentAt) {
//         statusIcon = <EllipsisHorizontalCircleIcon className="text-yellow-500 h-6 w-6"/>;
//         tooltipText += `Sent: ${sentAt}`;
//     } else {
//         statusIcon = <ExclamationCircleIcon className="text-red-500 h-6 w-6"/>;
//         tooltipText += `Not Sent`;
//     }
//
//     return (
//         <div className="flex items-center justify-between space-x-4">
//             <div className="flex items-center space-x-4">
//                 <Avatar>
//                     {avatar && (
//                         <AvatarImage src={avatar}/>
//                     )}
//                     <AvatarFallback>{fallback ? fallback : name?.charAt(0).toUpperCase()}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                     <p className="text-sm font-medium leading-none">{name}</p>
//                     <p className="text-sm text-muted-foreground">{phone}</p>
//                 </div>
//             </div>
//             <Tooltip>
//                 <TooltipTrigger asChild>
//                     <div className="flex flex-col justify-center items-center" title={tooltipText}>
//                         {statusIcon}
//                     </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                     {tooltipText}
//                 </TooltipContent>
//             </Tooltip>
//
//             <Select defaultValue="edit">
//                 <SelectTrigger className="ml-auto w-[110px]">
//                     <SelectValue placeholder="Select"/>
//                 </SelectTrigger>
//                 <SelectContent className="absolute">
//                     <SelectItem value="edit">Can edit</SelectItem>
//                     <SelectItem value="view">Can view</SelectItem>
//                 </SelectContent>
//             </Select>
//         </div>
//     )
// }
//

export function InvitationCard(invitation: InvitationsQueryType[0]) {
    const updateFrequency = 1000 * 60 * 10; // 10 minutes
    const [isExpired, setIsExpired] = React.useState(false); // [1
    const [progress, setProgress] = React.useState(100);
    const [expiresAt, setExpiresAt] = React.useState(new Date());

    useEffect(() => {
        // Function to calculate the percentage
        const updateProgress = () => {
            const uid = new ShortUniqueId();
            const recoveredTimestamp = uid.parseStamp(invitation.stamp_id);
            const percentage = (
                (new Date(recoveredTimestamp).getTime() - new Date().getTime()) /
                (new Date(recoveredTimestamp).getTime() - new Date(invitation.created_at).getTime())
            ) * 100;
            setExpiresAt(new Date(recoveredTimestamp));
            setProgress(percentage);
            setIsExpired(percentage <= 0);
        };

        // Calculate the percentage immediately and then set up the interval
        updateProgress();
        const interval = setTimeout(updateProgress, updateFrequency);

        return () => clearTimeout(interval);
    }, [invitation.stamp_id, invitation.created_at, updateFrequency]);

    // Function to format the date as "1st Jan 2021"
    // function formatDate(dateString: string) {
    //     const date = new Date(dateString);
    //     const day = date.getDate();
    //     const month = date.toLocaleString('en-ZA', {month: 'long'});
    //     const year = date.getFullYear();
    //     const hours = date.getHours();
    //     const minutes = date.getMinutes();
    //     const seconds = date.getSeconds();
    //
    //     // Function to get the ordinal suffix for the day
    //     const getOrdinalSuffix = (day: number) => {
    //         if (day > 3 && day < 21) return 'th';
    //         switch (day % 10) {
    //             case 1:
    //                 return "st";
    //             case 2:
    //                 return "nd";
    //             case 3:
    //                 return "rd";
    //             default:
    //                 return "th";
    //         }
    //     }
    //
    //     return `${day}${getOrdinalSuffix(day)} ${month} ${year} ${hours}:${minutes}:${seconds}`;
    // }
    const formatDate = (date: Date | string) => {
        if (typeof date === "string") {
            date = new Date(date);
        }
        return new Intl.DateTimeFormat('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            // hour12: true,
            // timeZoneName: 'short',
            // timeStyle: 'short',
        }).format(date);
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>{invitation.stamp_id}</CardTitle>
                <CardDescription>
                    <span className="font-semibold">Created: </span>
                    {formatDate(invitation.created_at)}
                    <br/>Only users invited by phone number can sign up with this link.
                </CardDescription>

            </CardHeader>
            <CardContent>
                {/* Overlay Spinner */}

                <div className="flex space-x-2">
                    <Input value={`${getBaseUrl()}/sign-up/${invitation.stamp_id}`} readOnly/>
                    <Button
                        onClick={() => copyToClipboard(`${getBaseUrl()}/sign-up/${invitation.stamp_id}`)}
                        variant="secondary"
                        className="shrink-0">
                        Copy Link
                    </Button>
                </div>
                <Separator className="my-4"/>
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">People invited</h4>
                    <div className="grid gap-6">
                        {invitation.messages_sent.map((person, index) => (
                            <InvitationSent key={invitation.id} {...person}/>
                        ))}
                    </div>
                </div>
            </CardContent>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Progress value={progress} className="rounded-lg" color={isExpired ? "red" : "green"}/>
                </TooltipTrigger>
                <TooltipContent>
                    {isExpired ? "This invitation has expired" : `This invitation will expire at ${expiresAt.toString()}`}
                </TooltipContent>
            </Tooltip>
        </Card>
    )
}