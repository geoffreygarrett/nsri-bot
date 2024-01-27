"use client";
import {useCallback, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Separator} from "@/components/ui/separator";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import InvitationForm, {InvitationFormValues} from "@/app/(dash)/invite/_components/invitation-form";

import {Loader2} from 'lucide-react';


export type Invitation = {
    id: string;
    pin: string;
    role: string;
    note?: string;
    numbers?: string[];
    metadata?: Record<string, any>;
    expiresAt?: string;
    singleUse?: boolean;
    usedCount?: number;
};

export default function InvitationDialog({onSubmit, open, setOpen, sending}: {
    onSubmit: (invitation: InvitationFormValues) => void,
    open: boolean,
    setOpen: (open: boolean) => void,
    sending: boolean
}) {

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Create Invitation</Button>
            </DialogTrigger>
            <DialogContent className={cn("sm:max-w-[425px]")}>

                {/* Overlay Spinner */}
                {sending && (
                    <div className="absolute inset-0 flex justify-center items-center z-50">
                        {/*<Loader2 className="animate-spin rounded-full h-10 w-10 border-b-4 border-gray-900"/>*/}
                        <Loader2 className="animate-spin h-14 w-14 stroke-2 z-50" color={"#2dc72d"}/>
                    </div>
                )}

                {/* Content Wrapper */}
                <div className={cn(sending && "blur-sm")}>
                    {/* Dialog Header */}
                    <DialogHeader>
                        <DialogTitle>Create Invitation</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new invitation.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Dialog Body within Form */}
                    {/*<InvitationForm onRoleChange={onRoleChange} pin={pin} setPin={setPin} numbers={numbers}*/}
                    {/*                setNumbers={setNumbers}/>*/}
                    <InvitationForm onSubmit={onSubmit}/>

                    {/*Dialog Footer */}
                </div>


                {/*Dialog Footer */}

            </DialogContent>
        </Dialog>
    )
}

import {
    Button
} from "@/components/ui/button";
import {cn} from "@/lib/utils";
