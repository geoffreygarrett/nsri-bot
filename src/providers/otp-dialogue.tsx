"use client";

import React, {useEffect, useState} from 'react';
import {OTP_EXPIRATION_TIME, useOTPDialog} from '@/providers/otp-provider';

import {toast} from "sonner";
import * as z from 'zod';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormControl, FormField, FormItem, Form, FormMessage} from "@/components/ui/form";
import {OtpInput} from "@/components/ui/otp";
import {Progress} from "@/components/progress";
import {Button} from "@/components/ui/button";
import {AuthApiError} from "@supabase/gotrue-js";
import {Input} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const otpSchema = z.object({
    otp: z.string().min(6, "OTP must be at least 6 characters.").optional(),
});

const OTPDialog = () => {
    const {isOpen, message, closeOTPDialog, verifyOTP, requestOTP, phone, countdown} = useOTPDialog();
    const form = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: '',
        }
    });

    const handleCloseDialog = () => {
        closeOTPDialog();
        form.reset();
    }

    const handleVerify = async (values: z.infer<typeof otpSchema>) => {
        console.log(values);
        // set values.otp to '' on success
        try {
            await verifyOTP(values.otp?.toString() || '');
            closeOTPDialog();
            toast.success("OTP verified successfully");
            form.reset();
        } catch (error: AuthApiError | any) {
            form.setError("otp", {message: error.message as string});
            toast.error("OTP verification failed: " + error.message);
            console.error('OTP verification failed:', error);
        }
    };

    const handleRequestOTP = async () => {
        // clear form errors
        form.clearErrors();
        try {
            await requestOTP(phone);
            toast.success("OTP sent successfully");
        } catch (error) {
            toast.error("OTP request failed");
        }
    };

    // when countdown is 0, set error on otp field
    useEffect(() => {
        if (countdown == 0) {
            form.setError("otp", {message: "OTP expired"});
        }
    }, [countdown, form]);

    // on enter key press, submit form
    // useEffect(() => {
    //     const handleEnterPress = (e: KeyboardEvent) => {
    //         if (e.key === "Enter") {
    //             form.handleSubmit(handleVerify)();
    //         }
    //     };
    //     window.addEventListener("keydown", handleEnterPress);
    //     return () => {
    //         window.removeEventListener("keydown", handleEnterPress);
    //     };
    // }, [form, handleVerify]);

    return (
        <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className={"space-y-2"}>
                <DialogHeader>
                    <p>{message}</p>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleVerify)}>
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <OtpInput length={6} {...field} className={"w-full"}/>
                                    </FormControl>
                                    <FormMessage className={"text-red-500"}/>
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-8 space-x-4">
                            <Button
                                type="submit"
                                disabled={!(countdown > 0 && countdown < OTP_EXPIRATION_TIME)}>
                                Verify
                            </Button>
                            <Button
                                onClick={handleRequestOTP}
                                disabled={countdown != 0}
                                variant={"secondary"}>
                                Resend OTP
                            </Button>
                            <Button
                                onClick={handleCloseDialog}
                                variant={"secondary"}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
                <Progress value={countdown / OTP_EXPIRATION_TIME * 100}
                          indicatorClassName={"bg-blue-500"}
                          className={"absolute rounded-t-none bottom-0"}/>
            </DialogContent>
        </Dialog>
    );
};

export default OTPDialog;
