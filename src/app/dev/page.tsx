"use client";

import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import supabase from '@/supabase';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useOTPProcess} from "@/providers/use-otp";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


const signUpSchema = z.object({
    phone: z.string().min(2, "Phone number must be at least 2 characters."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    otp: z.string().min(6, "OTP must be at least 6 characters."),
});

const requestOtpSchema = z.object({
    phone: z.string().min(2, "Phone number must be at least 2 characters."),
});

const verifyOtpSchema = z.object({
    phone: z.string().min(2, "Phone number must be at least 2 characters."),
    otp: z.string().min(6, "OTP must be at least 6 characters."),
});

import {ZodError, ZodIssue} from 'zod'

const formatZodIssue = (issue: ZodIssue): string => {
    const {path, message} = issue
    const pathString = path.join('.')

    return `${pathString}: ${message}`
}


const isValidPosition = (position: string) => {
    try {
        new Coordinates(position);
        return true;
    } catch (error: any) {
        throw new Error(error);
    }
};

const coordinatesSchema = z.object({
    position: z.string().refine(data => {
        try {
            return isValidPosition(data);
        } catch (error: any) {
            // Return the custom error message from isValidPosition
            return error.message;
        }
    }, "Invalid coordinates"), // Default message if another error type is thrown
});

import Coordinates from 'coordinate-parser';

export default function SignupForm() {
    const router = useRouter();
    const otp = useOTPProcess();

    const onSubmitSignUp = async (values: any) => {
        try {
            const {data, error} = await supabase.auth.signUp({
                phone: values.phone,
                password: values.password,
                options: {
                    data: {otp: values.otp},
                    channel: 'whatsapp',
                },
            });
            setResponse(JSON.stringify({data, error}, null, 2));
        } catch (error) {
            setResponse(JSON.stringify(error, null, 2));
        }
    };

    const onSubmitOTPRequest = async (values: any) => {
        await otp.initiateOTPRequest(values.phone);
        // try {
        //     const {data, error} = await supabase.auth.signInWithOtp({
        //         phone: values.phone,
        //         options: {
        //             channel: 'whatsapp',
        //         },
        //     });
        //     setResponse(JSON.stringify({data, error}, null, 2));
        // } catch (error) {
        //     setResponse(JSON.stringify(error, null, 2));
        // }
    };

    const onSubmitOTPVerify = async (values: any) => {
        await otp.initiateOTPVerification(values.otp);
        // try {
        //     const {data, error} = await supabase.auth.verifyOtp({
        //         phone: values.phone,
        //         token: values.otp,
        //         type: 'sms',
        //     });
        //     setResponse(JSON.stringify({data, error}, null, 2));
        // } catch (error) {
        //     setResponse(JSON.stringify(error, null, 2));
        // }
    };

    const [response, setResponse] = useState('');
    const {
        register: registerSignUp, handleSubmit: handleSubmitSignUp
    } = useForm({
        resolver: zodResolver(signUpSchema),
    });

    const {
        register: registerRequestOtp, handleSubmit: handleSubmitRequestOtp
    } = useForm({
        resolver: zodResolver(requestOtpSchema),
    });

    const {
        register: registerVerifyOtp, handleSubmit: handleSubmitVerifyOtp
    } = useForm({
        resolver: zodResolver(verifyOtpSchema),
    });


    const positionForm = useForm({
        resolver: zodResolver(coordinatesSchema),
    });


    // import React, { useState } from 'react';

    // position = new Coordinates('40:7:22.8N 74:7:22.8W');

    // latitude = position.getLatitude(); // 40.123 ✓
    // longitude = position.getLongitude(); // -74.123 ✓

    // const CoordinateInput = ({ name, placeholder }: { name: string; placeholder: string }) => {
    //     const [rawValue, setRawValue] = useState('');
    //     const [value, setValue] = useState('');
    //
    //     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //         const input = e.target.value;
    //         try {
    //             const position = new Coordinates(input);
    //             setRawValue(input);
    //             setValue(`${position.getLatitude()} ${position.getLongitude()}`);
    //         } catch (error) {
    //             // Handle invalid input
    //             console.error(error);
    //         }
    //     };
    //
    //
    //     // const handleFormatChange = (e) => {
    //     //     setFormat(e.target.value);
    //     //     try {
    //     //         setValue(convertedValue);
    //     //     } catch (error) {
    //     //         // Handle invalid input
    //     //         console.error(error);
    //     //     }
    //     // };
    //
    //     return (
    //         <div>
    //             {/*<select onChange={handleFormatChange} value={format}>*/}
    //             {/*    <option value="DDS">Decimal Degrees (DDS)</option>*/}
    //             {/*    <option value="DMS">Degrees, Minutes, Seconds (DMS)</option>*/}
    //             {/*    <option value="DMM">Degrees, Decimal Minutes (DMM)</option>*/}
    //             {/*</select>*/}
    //             <input
    //                 className="w-full"
    //                 type="text"
    //                 name={name}
    //                 placeholder={placeholder}
    //                 value={rawValue}
    //                 onChange={handleChange}
    //             />
    //             <p>{value}</p>
    //         </div>
    //     );
    // };

    // export default CoordinateInput;


// Usage in your existing form
//     const CoordinateForm = ({ form }) => (
//         <div>
//             {/*<FormField*/}
//             {/*    // control={form.control}*/}
//             {/*    name="lat"*/}
//             {/*    render={({ field }) => (*/}
//                     <FormItem>
//                         <FormLabel>Latitude</FormLabel>
//                         <FormControl>
//                             <CoordinateInput placeholder="Latitude" />
//                         </FormControl>
//                         <FormMessage />
//                     </FormItem>
//             {/*    )}*/}
//             {/*/>*/}
//             {/*<FormField*/}
//             {/*    // control={form.control}*/}
//             {/*    name="lng"*/}
//             {/*    render={({ field }) => (*/}
//                     <FormItem>
//                         <FormLabel>Longitude</FormLabel>
//                         <FormControl>
//                             <CoordinateInput placeholder="Longitude" />
//                         </FormControl>
//                         <FormMessage />
//                     </FormItem>
//             {/*    )}*/}
//             {/*/>*/}
//         </div>
//     );

    // export default CoordinateForm;


    return (
        <div className="space-y-4 max-w-md mx-auto p-4">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200">Sign Up for an Account</h2>
            <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="space-y-4">
                <Input {...registerSignUp("phone")} placeholder="Phone"/>
                <Input {...registerSignUp("password")} placeholder="Password" type="password"/>
                <Input {...registerSignUp("otp")} placeholder="OTP"/>
                <Button type="submit">Sign Up</Button>
            </form>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200">Request OTP</h2>
            <form onSubmit={handleSubmitRequestOtp(onSubmitOTPRequest)} className="space-y-4">
                <Input {...registerRequestOtp("phone")} placeholder="Phone"/>
                <Button type="submit">Request OTP</Button>
            </form>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200">Verify OTP</h2>
            <form onSubmit={handleSubmitVerifyOtp(onSubmitOTPVerify)} className="space-y-4">
                <Input {...registerVerifyOtp("phone")} placeholder="Phone"/>
                <Input {...registerVerifyOtp("otp")} placeholder="OTP"/>
                <Button type="submit">Verify OTP</Button>
            </form>

            <div>
                <h3>Response:</h3>
                <pre style={{whiteSpace: 'pre-wrap'}}>{response}</pre>
            </div>

            <Form {...positionForm}>
                <form onSubmit={positionForm.handleSubmit((data) => {
                    console.log(data);
                })} className="space-y-4">
                    <FormField
                        control={positionForm.control}
                        name="position"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Latitude</FormLabel>
                                <FormControl>
                                    <Input placeholder="Position" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
}
