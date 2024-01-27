import {Separator} from "@/components/ui/separator";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Progress} from "@/components/progress";
import {Input} from "@/components/ui/input";
import React from "react";


const progressBarColorMap = (time: number) => {
    if (time < 15) {
        return "bg-red-500";
    } else if (time < 30) {
        return "bg-yellow-500";
    } else {
        return "bg-blue-500";
    }
}


// {state.isOTPSent && !state.isOTPExpired && (
//     <>
//         <Separator/>
//         <FormField
//             control={form.control}
//             name="otp"
//             render={({field}) => (
//                 <FormItem>
//                     <FormLabel className="auth-form-label">
//                         OTP
//                         <span>{state.isOTPExpired ? " (expired)" : ` (${state.countdown})`}
//                                 </span>
//                     </FormLabel>
//                     <Progress value={state.countdown / 60 * 100}
//                               indicatorClassName={progressBarColorMap(state.countdown)}/>
//                     <FormControl>
//                         <Input placeholder="Enter your OTP" {...field}
//                                readOnly={!state.isOTPSent}
//                                className={"auth-form-input"}
//                                required={false}
//                         />
//                     </FormControl>
//                     <FormDescription className="auth-form-description">
//                         Your OTP must be at least 6 characters long.
//                     </FormDescription>
//                     <FormMessage className="text-red-700"/>
//                 </FormItem>
//             )}
//         />
//     </>
// )}
