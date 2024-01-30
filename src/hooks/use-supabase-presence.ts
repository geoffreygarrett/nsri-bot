import {useCallback, useEffect, useState} from "react";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {
    RealtimeChannelOptions,
    RealtimePresenceState,
    RealtimePresenceJoinPayload,
    RealtimePresenceLeavePayload,
    REALTIME_PRESENCE_LISTEN_EVENTS, RealtimeChannel
} from "@supabase/realtime-js";
import {useSupabaseClient} from "@supabase/auth-helpers-react";


export enum CHANNEL_STATES {
    closed = 'closed',
    errored = 'errored',
    joined = 'joined',
    joining = 'joining',
    leaving = 'leaving',
}


const useSupabasePresence = <T extends { [key: string]: any }>({roomName, options}: {
    roomName: string,
    supabase: SupabaseClient,
    options?: RealtimeChannelOptions
}) => {
    const supabase = useSupabaseClient();
    const [presenceData, setPresenceData] = useState<RealtimePresenceState<T>>({});
    const [channel, setChannel] = useState<RealtimeChannel>();

    useEffect(() => {
        const setupChannel = async () => {
            const channel = supabase.channel(roomName, options);


            channel
                .on('presence', {event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC}, () => {
                    console.log('SYNC', channel.presenceState());
                    setPresenceData(channel.presenceState() as RealtimePresenceState<T>);
                });

            channel
                .on('presence', {event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN}, (payload: RealtimePresenceJoinPayload<T>) => {
                    console.log('JOIN', payload);
                    setPresenceData(prev => ({...prev, [payload.key]: payload.newPresences}));
                });

            channel
                .on('presence', {event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE}, (payload: RealtimePresenceLeavePayload<T>) => {
                    console.log('LEAVE', payload);
                    setPresenceData(prev => {
                        const updatedPresences = {...prev};
                        delete updatedPresences[payload.key];
                        return updatedPresences;
                    });
                });

            channel.subscribe();

            setChannel(channel);
        };

        setupChannel().then();

        return () => {
            if (!channel) return;
            channel.unsubscribe().then();
            channel.untrack().then();
        };
    }, [roomName, options, supabase]);

    // Function to update presence state
    const updatePresenceState = useCallback(async (state: T) => {
        if (!channel) return;
        if (channel.state === CHANNEL_STATES.joined) {
            await channel.track(state);
        }
    }, [channel]);

    return {presenceData, updatePresenceState};
};

export default useSupabasePresence;
