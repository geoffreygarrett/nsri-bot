"use client"

import {CellContext, ColumnDef} from '@tanstack/react-table';
import {Tables} from '@/types/supabase';
import {copyToClipboard} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {getBaseUrl} from "@/code/domain";
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {docco, githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
// import dark theme now
import {dracula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {atomDark} from "react-syntax-highlighter/dist/esm/styles/prism";
import React, {useState} from "react";
import {useTheme} from "next-themes";
import {ClipboardDocumentCheckIcon, ClipboardDocumentIcon} from "@heroicons/react/24/outline";

const CellJson: React.FC<{ value: any }> = ({value}) => {
    const {resolvedTheme} = useTheme();
    const [copied, setCopied] = useState(false);
    const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent event from bubbling up
        copyToClipboard(safelyParseJson(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    };

    // if no content, return null
    if (!value) {
        return null;
    }

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="secondary"
                        className="text-xs hover:bg-gray-50 dark:hover:bg-gray-800 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    >Show</Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 m-0">
                    <>
                        <Button onClick={handleCopyClick} className="absolute top-0 right-0" variant="outline">
                            {!copied ?
                                <ClipboardDocumentIcon className="h-5 w-5"/>
                                : <ClipboardDocumentCheckIcon className="h-5 w-5"/>
                            }
                        </Button>
                        <SyntaxHighlighter language="json" style={resolvedTheme === 'dark' ? dracula : docco}
                                           className=" text-xs max-h-96 overflow-y-scroll">
                            {safelyParseJson(value)}
                        </SyntaxHighlighter>
                    </>

                </PopoverContent>
            </Popover>
        </>
    )
}

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }).format(date);
}

// const safelyParseJson = (jsonString) => {
//     try {
//         // Unescape known escape sequences in JSON
//         const unescapedString = jsonString
//             .replace(/\\"/g, '"')  // Unescape double quotes
//             .replace(/\\\\/g, '\\') // Unescape backslashes
//             .replace(/\\n/g, '\n')  // Unescape newlines
//             .replace(/\\t/g, '\t') // Unescape tabs , also nextline escale backslash
//             .replace(/\\r/g, '\r'); // Unescape carriage returns
//
//         console.log(unescapedString)
//         const parsed = JSON.parse(unescapedString);
//
//         if (typeof parsed === 'object' && parsed !== null) {
//             // Recursively process each property if it's an object
//             return JSON.stringify(
//                 Object.fromEntries(
//                     Object.entries(parsed).map(([key, value]) =>
//                         [key, typeof value === 'string' ? safelyParseJson(value) : value]
//                     )
//                 ),
//                 null, 2
//             );
//         }
//
//         return JSON.stringify(parsed[0], null, 2);
//     } catch {
//         // If parsing fails, return the original string
//         return jsonString;
//     }
// };


const safelyParseJson = (jsonString: string) => {
    // Check if the jsonString is not empty and is a valid JSON structure
    if (!jsonString || (jsonString[0] !== '{' && jsonString[0] !== '[')) {
        console.error("Invalid JSON string:", jsonString);
        return jsonString; // Return the original string if it's invalid
    }

    try {
        let parsed = JSON.parse(jsonString);

        // Handle the nested JSON in 'contentVariables'
        if (Array.isArray(parsed)) {
            parsed = parsed.map(item => {
                if (item.contentVariables && typeof item.contentVariables === 'string') {
                    try {
                        // Attempt to parse the 'contentVariables' string directly without regex replacement
                        item.contentVariables = JSON.parse(item.contentVariables);
                    } catch (error) {
                        console.error("Error parsing nested JSON in 'contentVariables':", error, "\nProblematic string:", item.contentVariables);
                    }
                }
                return item;
            });
        }

        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        console.error("Error parsing JSON:", error, "\nProblematic string:", jsonString);
        return jsonString; // Return the original string if JSON parsing fails
    }
};

const parseJSON = (value: any) => {
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return 'Invalid JSON';
    }
};

const recursivelyParseJSON = (value: any) => {
    try {
        let result = value;
        while (typeof result === 'string') {
            result = JSON.parse(result);
        }
        return JSON.stringify(result, null, 2);
    } catch {
        return 'Invalid JSON';
    }
};

const parseAndFormatJson = (jsonString: string) => {
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2); // Pretty print the JSON
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return "Invalid JSON"; // Or any other error handling
    }
};


export const columns: ColumnDef<Tables<'log_endpoint'>>[] = [
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>
        ) => formatDate(new Date(info.getValue())),
    },
    {
        accessorKey: 'endpoint',
        header: 'Endpoint',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>) => {
            return (
                <Badge variant={"outline"}>
                    {info.getValue().replace(getBaseUrl(), '')}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'parent_endpoint',
        header: 'Parent Endpoint',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>) => {
            return (
                <Badge variant={"outline"}>
                    {info.getValue().replace(getBaseUrl(), '')}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'method',
        header: 'Method',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>) => {
            return (
                <Badge className={"text-xs bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800"}
                       variant={"outline"}
                >
                    {info.getValue()}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'request_body',
        header: 'Request Body',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>) => {
            const value = info.getValue();
            if (value === null) {
                return null;
            }
            return (
                <CellJson value={value}/>
            );
        },
    },
    {
        accessorKey: 'response_body',
        header: 'Response Body',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>) => {
            const value = info.getValue();
            if (value === null) {
                return null;
            }
            return (
                <CellJson value={value}/>
            );
        },
    },
    {
        accessorKey: 'response_status',
        header: 'Response Status',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'ip',
        header: 'IP Address',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'error',
        header: 'Error',
        cell: (info: CellContext<Tables<'log_endpoint'>, any>) => {
            const value = info.getValue();
            if (value === null) {
                return null;
            }
            return (
                <CellJson value={value}/>
            );
        },
    },
    // Additional columns as needed
];
