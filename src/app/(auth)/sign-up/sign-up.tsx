"use client";

import React, {useEffect, useReducer, useState} from 'react';
import {ControllerRenderProps, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import supabase from '@/supabase';
import {useRouter} from 'next/navigation';
import {Progress} from "@/components/progress";


import {Button} from '@/components/ui/button';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {toast} from "sonner";


import PhoneInput, {formatPhoneNumberIntl} from 'react-phone-number-input'
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {
    CountryCode,
    format,
    getCountries,
    getCountryCallingCode,
    parse,
    parseIncompletePhoneNumber
} from "libphonenumber-js";
import Image from "next/image";
import {intlPhoneNumber, phoneShape, signUpSchema} from "@/schema";
import {AsYouType} from 'libphonenumber-js'
import {useTheme} from "next-themes";
import {PhoneNumberInput} from "../phone-number-input";
import {useOTPDialog} from "@/providers/otp-provider";
import {SIGN_IN_PATH} from "@/constants";
import {formatPhone} from "@/app/(auth)/format-phone";


export default function SignupForm({stamp}: { stamp: string }) {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            stamp: stamp,
            phone: {country: "ZA" as CountryCode, number: ""},
            password: "",
        },
    });
    const {requestOTP, verifyOTP, openOTPDialog} = useOTPDialog();

    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        console.log(values)
        fetch('/api/auth/sign-up', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values),
        }).then(response => {
            console.log(response)
            if (response.status === 404) {
                form.setError("stamp", {message: "Stamp not found"})
            } else if (response.status === 401) {
                form.setError("phone", {message: "Phone number not invited"})
            } else if (response.status === 409) {
                form.setError("phone", {message: "Phone number is already registered"})
                toast("Phone number is already registered", {
                    description: "Please sign in instead",
                    action: {
                        label: "Sign in",
                        onClick: () => router.push(SIGN_IN_PATH)
                    },
                })
            } else if (response.status === 500) {
                form.setError("phone", {message: "Internal server error"})
            } else {
                openOTPDialog({
                        message: "Enter OTP",
                        phone: formatPhone(values.phone.number, values.phone.country),
                        onVerified: () => {
                            router.push(SIGN_IN_PATH)
                        }
                    }
                )
            }
        })
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-8"}>
                {/*<form className={"space-y-8"} action="#" method="POST">*/}
                <FormField
                    control={form.control}
                    name="stamp"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="auth-form-label">
                                Stamp
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the signup stamp" {...field}
                                       readOnly={true}
                                    // className="auth-form-input"
                                />
                            </FormControl>
                            <FormDescription className="auth-form-description">
                                Only available to invited users.
                            </FormDescription>
                            <FormMessage className="auth-form-message"/>
                        </FormItem>
                    )}
                />
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
                            </FormControl>
                            <FormDescription className="auth-form-description">
                                This will be your username.
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
                                <Input type="password" placeholder="Enter your password" {...field}
                                       readOnly={false}
                                       autoComplete={"new-password"}
                                       className="auth-form-input"/>
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
                    className="auth-form-button">
                    Submit
                </Button>
            </form>
        </Form>
    );
}