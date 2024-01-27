import React from "react";
import ErrorPage from "@/components/error-page";

export default function Page() {
    return (
        <ErrorPage description={"Sorry, we couldn’t find the page you’re looking for."}
                   errorCode={"404"}
                   imageUrl={"/404.jpeg"}
                   blurUrl={"/404.jpeg"}
                   title={"Page not found"}/>
    )
}
