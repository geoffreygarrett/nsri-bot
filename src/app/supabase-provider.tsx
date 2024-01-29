'use client'

import {SessionContextProvider, useSession, useUser} from "@supabase/auth-helpers-react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import React, {useEffect} from "react";
import {PermissionProvider, usePermission} from "react-permission-role";
import {rolePermissionResponseSchema} from "@/app/_services/roles-permissions";
import {useFetch} from "@/hooks/use-fetch";


const PermissionWrapper: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {setUser} = usePermission();
    const user = useUser();
    const session = useSession();
    const {loading, error, value} = useFetch(
        `/api/roles-permissions`,
        {},
        [session, user]
    )

    useEffect(() => {
        if (error || !user || loading) {
            setUser({
                id: "",
                roles: [],
                permissions: []
            });
        } else if (value) {
            try {
                const parsed = rolePermissionResponseSchema.parse(value); // Parse the actual data
                setUser({
                    id: user?.id,
                    roles: parsed.roles,
                    permissions: parsed.permissions
                });
                console.log("Permissions-roles:", parsed);
            } catch (error) {
                // Handle Zod parsing errors
                console.error("Zod parsing error:", error);
            }
        }
    }, [user, setUser, value, error, loading])

    return <>{children}</>
}

export default function SupabaseProvider({children, initialSession}: {
    children: React.ReactNode
    initialSession: any
}) {
    const supabase = createClientComponentClient<Database>();
    return (
        <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
            <PermissionProvider>
                <PermissionWrapper>
                    {children}
                </PermissionWrapper>
            </PermissionProvider>
        </SessionContextProvider>
    )
}
