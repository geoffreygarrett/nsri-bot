"use client";

import {InvitationFormValues} from "@/app/(dash)/invite/_components/invitation-form";
import React, {useCallback, useEffect, useState} from 'react';
import {Label} from "@/components/ui/label"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {Database} from "@/types/supabase";
import {toast} from "sonner";
import InvitationDialog from "@/app/(dash)/invite/_components/invitation-dialog";
import {useSupabaseClient, useUser} from "@supabase/auth-helpers-react";
import {useConfirm} from "@/providers/confirmation-provider";
import {InvitationCard, InvitationCardSkeleton} from "@/app/(dash)/invite/_components/invite-card";
import {InvitationsQueryType, makeInvitationsQuery} from "@/types/queries";
import {useFetch} from "@/hooks/use-fetch";
import {v4 as uuidv4} from 'uuid';


const AdminView: React.FC = () => {
    const supabase = useSupabaseClient<Database>();
    const user = useUser();
    const confirm = useConfirm();
    // const [sending, setSending] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [invitations, setInvitations] = useState<InvitationsQueryType>([]);
    const [sendingInvitationSkeletons, setSendingInvitationSkeletons] = useState<InvitationFormValues[]>([]);

    const {loading, error, value} = useFetch<{data:InvitationsQueryType}>(
        `/api/invitations`,
        {},
        []
    );

    useEffect(() => {
        if (error) {
            toast.error("Error fetching invitations");
        }
    }, [error]);

    useEffect(() => {
        console.log(value)
        if (error || !user || loading || !value) {
            setInvitations([]);
        } else if (value) {
            try {
                setInvitations(value.data); // Parse the actual data
                console.log("Invitations:", value);
            } catch (error) {
                // Handle Zod parsing errors
                console.error("Zod parsing error:", error);
            }
        }
    }, [error, loading, user, value])


    // Function to confirm and submit the invitation
    const confirmSubmit = useCallback(async (invitationValues: InvitationFormValues) => {
        const invitationPayload = {...invitationValues, id: uuidv4()};
        console.log("Invitation payload:", invitationPayload);
        setDialogOpen(false); // Close the invitation dialog
        setSendingInvitationSkeletons(skeletons => [...skeletons, invitationPayload]);
        const {data, error} = await fetch(`/api/invite`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                ...invitationPayload,
                id: uuidv4()
            }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Invitation created successfully:", response);
                    toast.success("Invitation created successfully");
                    return response.json();
                } else {
                    console.error("Failed to create invitation:", response);
                    toast.error("Failed to create invitation");
                    return response.json();
                }
            });

        console.log(data, error)
        // const {invitation, messages_sent} = response;
        if (error) {
            toast.error("Error creating invitation: " + error.message);
            setSendingInvitationSkeletons(skeletons => skeletons.filter(skeleton => skeleton !== invitationPayload));
            return;
        }
        const {invitation, messages_sent} = data;
        setInvitations((invitations) => [{...invitation, messages_sent}, ...invitations]);
        setSendingInvitationSkeletons(skeletons => skeletons.filter(skeleton => skeleton !== invitationPayload));
    }, []); // Dependency array for useCallback


    useEffect(() => {
        if (loading) return
        if (user?.id === null) return
        if (invitations === null || invitations === undefined) return;
        console.log("Invitations:", invitations);
        const message_ids = invitations.map(invitation => invitation.messages_sent.map(message => message?.id)).flat(2)
        const channel = supabase
            // .channel(`$user:${user?.id}:invitations:messages_sent`)
            .channel(`invitations:messages_sent`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages_sent',
                    filter: `id=in.(${message_ids})`,
                },
                (payload) => {
                    switch (payload.eventType) {
                        case 'UPDATE':
                            setInvitations((prevInvites) => prevInvites.map(invite => {
                                if (invite.messages_sent?.some(message => message?.id === payload.new.id)) {
                                    return {
                                        ...invite,
                                        messages_sent: invite.messages_sent?.map(message =>
                                            message?.id === payload.new.id ? {...message, ...payload.new} : message
                                        )
                                    };
                                } else {
                                    return invite;
                                }
                            }));
                            break;
                        // ... other cases
                    }
                    // refetch().then(r => console.log(r))
                }
            )
            ?.subscribe()
        return () => {
            supabase.removeChannel(channel).then(r => console.log(r))
        }
    }, [supabase, user?.id, invitations, loading])


    const onSubmit = async (values: InvitationFormValues) => {
        // Set up the payload and open the confirmation dialog
        confirm({
            title: 'Confirm Invitation Creation',
            description: 'Do you want to create this invitation?',
            actions: [
                {label: 'Create', onClick: () => confirmSubmit(values)}
            ],
        });
    };


    return (
        <TooltipProvider>
            <div className="p-2 w-full max-w-4xl mx-auto sm:pt-2 h-[calc(100dvh-3rem)]">
                <div className="flex flex-row justify-between items-center py-2 md:py-10">
                    <Label htmlFor="terms">
                        <h2 className="text-2xl mb-4">Invitation List</h2>
                    </Label>
                    <InvitationDialog onSubmit={onSubmit} open={dialogOpen} setOpen={setDialogOpen} sending={false}/>
                </div>

                <div className="space-y-2 md:space-y-4 pb-4 md:pb-10">
                    {
                        sendingInvitationSkeletons.map((invitation, index) => (
                            <InvitationCardSkeleton numberOfPeople={invitation.numbers?.length ?? 0} key={index}
                                                    spinner={true}/>
                        ))
                    }
                    {
                        loading && (Array.from(Array(20).keys()).map((i) => (
                            <InvitationCardSkeleton numberOfPeople={1} key={i} spinner={false}/>
                        )))
                    }
                    {
                        invitations?.map(invitation => (
                            <InvitationCard key={invitation.id} {...invitation}/>
                        ))
                    }
                </div>
            </div>
        </TooltipProvider>

    );
};

export default AdminView;