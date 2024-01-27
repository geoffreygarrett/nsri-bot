import {useCallback} from "react";
import {Invitation} from "@/app/(dash)/invite/_components/invitation-dialog";
import {getBaseUrl} from "@/code/domain";

const renderTemplate = (template: string, vars: Record<string, string>) => {
    return template.replace(templateRegex, (match, p1) => {
            return vars[p1];
        }
    )
}

// const template: string = "*Invitation*\`\`\`\n\nRole: {{role}}\nPin: {{pin}}\`\`\`\n\n{{url}}/signup/{{id}}";
const template: string = "*NSRI Invitation*\n\nYou're invited to NSRI as a *{{2}}*. Use this PIN for signup: *{{3}}*.\n\n{{4}}/sign-up/{{5}}";
const templateRegex = /{{(\w+)}}/g;
// body: renderTemplate(template, {
//     2: invite.role,
//     3: invite.pin,
//     4: getBaseUrl(),
//     5: `${invite.id}`,
// }),

// body: renderTemplate(template, {
//     role: invite.role,
//     pin: invite.pin,
//     url: getBaseUrl(),
//     id: invite.id,
//     phone: user.phone,
// }),


// General POST request function
const postRequest = async (endpoint: string, body: Record<string, any>) => {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Unknown error occurred");
    }
    return data; // Return data
}

// Handler for sending to self
// const handleSendToSelf = useCallback(async (invite: Invitation) => {
//     if (!user?.phone) {
//         console.error("No user or user phone number available.");
//         return;
//     }
//
//     const endpoint = `${getBaseUrl()}/api/wa/send`;
//     const body = {
//         to: `whatsapp:${user.phone}`,
//         from: 'MGe78fadf418b09d3df1924001b5007712',
//         body: renderTemplate(template, {
//             2: invite.role,
//             3: invite.pin,
//             4: getBaseUrl(),
//             5: `${invite.id}`,
//         }),
//     };
//
//     await postRequest(endpoint, body)
//         .then((response) => {
//                 if (response.ok) {
//                     console.log("Message sent successfully:", response);
//                 } else {
//                     console.error("Failed to send message:", response);
//                 }
//             }
//         );
//
// }, [renderTemplate, user]); // Dependency array for useCallback

// Handler for sending to a specific phone
// const handleSendToPhone = useCallback(async (invite: Invitation, phone: string) => {
//     const endpoint = `${getBaseUrl()}/api/wa/send`;
//     const body = {
//         // to: `whatsapp:${phone}`,
//         // from: 'MGe78fadf418b09d3df1924001b5007712',
//         // body: renderTemplate(template, {
//         //     2: "User", // TODO: Change to "invite.role
//         //     3: invite.pin,
//         //     4: getBaseUrl(),
//         //     5: `${invite.id}?phone=${phone}`.replace("+", ""),
//         // }),
//
//         to: `whatsapp:${phone}`,
//         from: "MGe78fadf418b09d3df1924001b5007712",
//         contentSid: 'HX557b802ca2a6703b59b2f75959604965',
//         contentVariables: JSON.stringify({
//             1: `x71823?phone=${phone}`.replace("+", ""),
//             2: "User", // TODO: Change to "invite.role
//             3: invite.pin,
//         }),
//     };
//     await postRequest(endpoint, body)
//         .then((response) => {
//                 if (response.ok) {
//                     console.log("Message sent successfully:", response);
//                 } else {
//                     console.error("Failed to send message:", response);
//                 }
//             }
//         );
//
// }, []); // Dependency array for useCallback
