import LoginForm from "@/app/(auth)/sign-in/sign-in";
import {Card, CardHeader, CardContent} from "@/components/ui/card";

export default function Page() {
    return (
        <>
                <CardHeader className={"text-center text-3xl font-extrabold text-gray-900 dark:text-gray-200"}>
                    Sign in to your account
                </CardHeader>
                <CardContent>
                    <LoginForm/>
                </CardContent>
        </>
    )
}