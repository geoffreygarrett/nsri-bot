"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"
import {useSearchParams} from 'next/navigation'

import {Button} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import React from "react";
import {useRouter} from "next/navigation";
import {Database} from "@/supabase";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {signInSchema} from "@/schema";
import {CountryCode} from "libphonenumber-js";
import {PhoneNumberInput} from "@/app/(auth)/phone-number-input";
import {formatPhone} from "../format-phone";


export function LoginForm() {
    const params = useSearchParams();
    const supabase = createClientComponentClient<Database>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            phone: {
                country: searchParams.get("country") as CountryCode || "ZA" as CountryCode,
                number: searchParams.get("number") || ""
            },
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof signInSchema>) {
        const {data, error} = await supabase.auth.signInWithPassword(
            {
                phone: formatPhone(values.phone.number, values.phone.country),
                password: values.password
            }
        )
        router.refresh();

        console.log("data", data)
        console.log("error", error)
        console.log("error?.status", error?.status)
        console.log("error?.message", error?.message)
        console.log("error?.name", error?.name)
        console.log("error?.stack", error?.stack)


        if (error) {
            form.setError("password",
                {
                    message: error?.message
                }
            )
        } else {
            // const redirectTo =
            router.push(params.get("redirectTo") || "/profile");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="auth-form-label">
                                WhatsApp Phone
                            </FormLabel>
                            <FormControl>
                                <PhoneNumberInput {...field}/>
                                {/*<Input placeholder="Enter your WhatsApp phone number" {...field}*/}
                                {/*       className="auth-form-input"*/}
                                {/*       autoComplete={"username"}/>*/}
                            </FormControl>
                            <FormDescription className="auth-form-description">
                                This is the name you&apos;ll use to log in.
                            </FormDescription>
                            <FormMessage className="auth-form-message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="auth-form-label">
                                Password
                            </FormLabel>
                            <FormControl>
                                <Input type="password"
                                       className="auth-form-input"
                                       placeholder="Enter your password" {...field}
                                       autoComplete={"current-password"}/>
                            </FormControl>
                            <FormDescription className="auth-form-description">
                                Your password must be at least 6 characters long.
                            </FormDescription>
                            <FormMessage className="auth-form-message"/>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Log in
                </Button>
            </form>
        </Form>

    )
}

export default LoginForm;