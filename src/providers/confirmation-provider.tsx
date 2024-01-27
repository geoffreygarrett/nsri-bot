"use client";

import React, {createContext, useContext, useState, ReactNode} from 'react';

interface Action {
    label: string;
    className?: string;
    onClick: () => void;
}

interface DialogOptions {
    title?: string;
    description?: string;
    actions: Action[];
    cancelAction?: Action;
}

interface DialogContextType {
    dialog: {
        isOpen: boolean;
        title?: string;
        description?: string;
        actions: Action[];
        cancelAction: Action;
    };
    openDialog: (options: DialogOptions) => void;
    closeDialog: () => void;
}

const defaultDialogContext: DialogContextType = {
    dialog: {
        isOpen: false,
        actions: [],
        cancelAction: {
            label: 'Cancel', onClick: () => {
            }
        },
    },
    openDialog: () => {
    },
    closeDialog: () => {
    },
};

const ConfirmationDialogContext = createContext<DialogContextType>(defaultDialogContext);

export const ConfirmationDialogProvider = ({children}: { children: ReactNode }) => {
    const [dialog, setDialog] = useState(defaultDialogContext.dialog);

    const openDialog = (options: DialogOptions) => {
        setDialog({
            isOpen: true,
            // actions: [],
            cancelAction: {
                label: 'Cancel', onClick: () => {
                }
            },
            ...options,
        });
    };

    const closeDialog = () => {
        setDialog(prev => ({...prev, isOpen: false}));
    };

    return (
        <ConfirmationDialogContext.Provider value={{dialog, openDialog, closeDialog}}>
            {children}
        </ConfirmationDialogContext.Provider>
    );
};

export const useConfirmationDialog = () => useContext(ConfirmationDialogContext);

interface Action {
    label: string;
    onClick: () => void;
}

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

const ConfirmationDialog = () => {
    const {dialog, closeDialog} = useConfirmationDialog();

    // if (!dialog.isOpen) return null;

    return (
        <AlertDialog open={dialog.isOpen} onOpenChange={closeDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dialog.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {dialog.cancelAction && (
                        <AlertDialogCancel onClick={() => {
                            dialog.cancelAction.onClick();
                            closeDialog();
                        }}>
                            {dialog.cancelAction.label}
                        </AlertDialogCancel>
                    )}
                    {dialog.actions.map((action, index) => (
                        <AlertDialogAction key={index}
                                           className={action.className}
                                           onClick={() => {
                            action.onClick();
                            closeDialog();
                        }}>
                            {action.label}
                        </AlertDialogAction>
                    ))}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmationDialog;

export const useConfirm = () => {
    const {openDialog} = useContext(ConfirmationDialogContext);

    const confirm = (options: DialogOptions) => {
        openDialog({
            ...options,
            cancelAction: options.cancelAction ?? {
                label: 'Cancel', onClick: () => {
                }
            }
        });
    };

    return confirm;
};


