import React from "react";
import ConfirmationDialog, {ConfirmationDialogProvider} from "@/providers/confirmation-provider";
import OTPDialog from "@/providers/otp-dialogue";
import {Toaster} from "@/components/ui/sonner";
import {ThemeProvider} from "@/components/layout/theme-provider";
import {OTPDialogProvider} from "@/providers/otp-provider";
import SupabaseProvider from "@/app/supabase-provider";

import {PermissionProvider, usePermission} from "react-permission-role";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {cookies} from "next/headers";
import {useUser} from "@supabase/auth-helpers-react";


const AppProviders: React.FC<{ children: React.ReactNode }> = async ({children}) => {
    const supabase = createServerComponentClient<Database>({cookies});
    const session = await supabase.auth.getSession();

    return (
        <>
            <SupabaseProvider initialSession={(session.data.session ? session.data.session : null)}>
                <ConfirmationDialogProvider>
                    <OTPDialogProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange>
                                {children}
                        </ThemeProvider>
                        <ConfirmationDialog/>
                        <OTPDialog/>
                    </OTPDialogProvider>
                </ConfirmationDialogProvider>
                <Toaster/>

            </SupabaseProvider>
        </>
    )
}

export default AppProviders