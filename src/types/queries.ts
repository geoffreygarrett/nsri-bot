import supabase, {Database} from "@/supabase";
import {QueryData} from "@supabase/supabase-js";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";

export const makeInvitationsQuery = (supabase: SupabaseClient<Database>) => {
    return supabase
        .from('invitations')
        .select(` *, messages_sent ( * )`);
}

export const invitationsQuery = supabase
    .from('invitations')
    .select(`*, messages_sent ( * )`);

export type InvitationsQueryType = QueryData<typeof invitationsQuery>;

