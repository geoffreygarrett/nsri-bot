import {createClient} from "@supabase/supabase-js";
import {Database, Tables, Enums} from "@/types/supabase";

export default createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type {Database, Tables, Enums};