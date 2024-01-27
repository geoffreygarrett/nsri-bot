import {diff} from "json-diff-ts";
import {MinusIcon, PencilIcon, PlusIcon} from "@heroicons/react/24/outline";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import React from "react";

export const ChangesDiffViewer = ({oldData, newData, diffOptions}: { oldData: any, newData: any, diffOptions?: any }) => {
    const diffs = diff(oldData, newData, diffOptions);

    const changeStyle = (type: string) => {
        switch (type) {
            case 'ADD':
                return {color: 'green'};
            case 'REMOVE':
                return {color: 'red'};
            case 'UPDATE':
                return {color: 'blue'};
            default:
                return {};
        }
    };

    const iconStyle = (type: string, className: string) => {
        switch (type) {
            case 'ADD':
                return <PlusIcon className={className}/>;
            case 'REMOVE':
                return <MinusIcon className={className}/>;
            case 'UPDATE':
                return <PencilIcon className={className}/>;
            default:
                return {};
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>
                    Changes
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 overflow-auto max-h-[300px]">
                {diffs.map((change, index) => (
                    <React.Fragment key={index}>
                        <div
                            className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground overflow-auto">
                            <>
                                {iconStyle(change.type, 'mt-px h-5 w-5 text-accent')}
                            </>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{change.key}</p>
                                <p className="text-sm text-muted-foreground">
                                    {change.type === 'UPDATE' && (
                                        <span>Old value: {JSON.stringify(change.oldValue)}<br/></span>
                                    )}
                                    {change.type === 'UPDATE' && (
                                        <span>New value: {JSON.stringify(change.value)}<br/></span>
                                    )}
                                    {change.type === 'ADD' && (
                                        <span>Value: {JSON.stringify(change.value)}<br/></span>
                                    )}
                                    {change.type === 'REMOVE' && (
                                        <span>Value: {JSON.stringify(change.oldValue)}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </CardContent>
        </Card>
    );
};

