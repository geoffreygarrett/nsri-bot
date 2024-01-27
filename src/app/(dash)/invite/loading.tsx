import {InvitationCard, InvitationCardSkeleton, PersonSkeleton} from "./_components/invite-card";
import {TooltipProvider} from "@/components/ui/tooltip";
import {Label} from "@/components/ui/label";
import InvitationDialog from "@/app/(dash)/invite/_components/invitation-dialog";
import React from "react";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
            <div className="p-2 w-full max-w-4xl mx-auto sm:pt-2 h-[calc(100dvh-3rem)]">
                <div className="flex flex-row justify-between items-center py-2 md:py-10">
                    <Label htmlFor="terms">
                        <Skeleton className="w-32 h-10" />
                        {/*<h2 className="text-2xl mb-4">Invitation List</h2>*/}
                    </Label>
                    <Skeleton className="w-32 h-10" />
                    {/*<InvitationDialog onSubmit={onSubmit} open={dialogOpen} setOpen={setDialogOpen} sending={false}/>*/}
                </div>

                <div className="space-y-2 md:space-y-4 pb-4 md:pb-10">
                    {Array.from(Array(20).keys()).map((i) => (
                        <InvitationCardSkeleton numberOfPeople={3} key={i} spinner={false}/>
                    ))}
                    {/*{*/}
                    {/*    sendingInvitationSkeletons.map((invitation, index) => (*/}
                    {/*        <InvitationCardSkeleton numberOfPeople={invitation.numbers?.length ?? 0} key={index}*/}
                    {/*                                spinner={true}/>*/}
                    {/*    ))*/}
                    {/*}*/}
                    {/*{*/}
                    {/*    invitations?.map(invitation => (*/}
                    {/*        <InvitationCard key={invitation.id} {...invitation}/>*/}
                    {/*    ))*/}
                    {/*}*/}
                </div>
            </div>
    );
};
//