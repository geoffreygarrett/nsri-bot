import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import * as MenubarPrimitive from "@radix-ui/react-menubar"
import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {useUser} from "@supabase/auth-helpers-react";
import {formatPhoneNumberIntl, Value as E164Number} from "react-phone-number-input/min";

type AvatarMenuItem = {
    label: string;
    action: () => void;
    bottomSeparator?: boolean;
    topSeparator?: boolean;
};


export function UserNav({children, items}: { children: React.ReactNode, items?: AvatarMenuItem[] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">shadcn</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            m@example.com
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Billing
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>New Team</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuItem>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export const AvatarMenu = ({children, items}: { children: React.ReactNode, items?: AvatarMenuItem[] }) => {
    const user = useUser();

    const [userInfo, setUserInfo] = useState({
        nickname: '',
        identity: '',
    });

    useEffect(() => {
        let identity = '';
        let nickname = '';

        if (user?.phone) {
            identity = formatPhoneNumberIntl("+" + user.phone);
        } else if (user?.email) {
            identity = user.email;
        }

        if (user?.user_metadata?.full_name) {
            nickname = user.user_metadata.full_name;
        } else if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
            nickname = user.user_metadata.first_name + " " + user.user_metadata.last_name;
        } else if (user?.user_metadata?.first_name) {
            nickname = user.user_metadata.first_name;
        }

        setUserInfo({nickname, identity});
    }, [user]); // Only re-run the effect if user changes

    console.log(formatPhoneNumberIntl(user?.phone as E164Number))


    if (!items || items?.length === 0) return (<>{children}</>);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className={"flex h-9 items-center"}>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={5}>
                {user && (
                    <>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userInfo.nickname}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userInfo.identity}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                    </>
                )}
                {items?.map((item, index) => (
                    <React.Fragment key={`${item.label}-${index}`}>
                        {item.topSeparator && <DropdownMenuSeparator/>}
                        <DropdownMenuItem onSelect={item.action}>
                            {item.label}
                        </DropdownMenuItem>
                        {item.bottomSeparator && <DropdownMenuSeparator/>}
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );


    // return (
    //     <MenubarPrimitive.Root className={"flex h-9 items-center"}>
    //         <MenubarMenu>
    //             <MenubarPrimitive.Trigger className={"bg-inherit"}>
    //                 {children}
    //             </MenubarPrimitive.Trigger>
    //             <MenubarContent>
    //                 {
    //                     items.map((item, index) => (
    //                         <React.Fragment key={`${item.label}-${index}`}>  {/* Ensuring unique key */}
    //                             {item.topSeparator && <MenubarSeparator/>}
    //                             <MenubarItem onClick={item.action}>
    //                                 {item.label}
    //                             </MenubarItem>
    //                             {item.bottomSeparator && <MenubarSeparator/>}
    //                         </React.Fragment>
    //                     ))
    //                 }
    //             </MenubarContent>
    //         </MenubarMenu>
    //     </MenubarPrimitive.Root>
    // )

}