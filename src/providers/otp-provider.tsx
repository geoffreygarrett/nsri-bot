"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import supabase from '@/supabase';

export const OTP_EXPIRATION_TIME = 60; // 60 seconds

interface OTPDialogOptions {
    phone: string;
    message: string;
    onVerified: () => void;
    onCancel?: () => void;
}

interface OTPDialogContextType {
    isOpen: boolean;
    message: string;
    phone: string;
    countdown: number;
    onVerified: () => void;
    openOTPDialog: (options: OTPDialogOptions) => void;
    closeOTPDialog: () => void;
    requestOTP: (phone: string) => Promise<void>;
    verifyOTP: (otp: string) => Promise<void>;
}

const defaultOTPDialogContext: OTPDialogContextType = {
    isOpen: false,
    message: '',
    phone: '',
    countdown: OTP_EXPIRATION_TIME,
    onVerified: () => {},
    openOTPDialog: () => {},
    closeOTPDialog: () => {},
    requestOTP: async () => {},
    verifyOTP: async () => {},
};

const OTPDialogContext = createContext<OTPDialogContextType>(defaultOTPDialogContext);

export const OTPDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dialogState, setDialogState] = useState(defaultOTPDialogContext);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (dialogState.isOpen && dialogState.countdown > 0) {
            timer = setTimeout(() => {
                setDialogState(prev => ({ ...prev, countdown: prev.countdown - 1 }));
            }, 1000);
        }

        return () => clearTimeout(timer);
    }, [dialogState.isOpen, dialogState.countdown]);

    const openOTPDialog = useCallback((options: OTPDialogOptions) => {
        setDialogState({
            ...dialogState,
            isOpen: true,
            message: options.message,
            phone: options.phone,
            countdown: OTP_EXPIRATION_TIME
        });
    }, [dialogState]);

    const resetTimer = useCallback(() => {
        setDialogState(prev => ({ ...prev, countdown: OTP_EXPIRATION_TIME }));
    }, []);

    const closeOTPDialog = useCallback(() => {
        setDialogState(prev => ({ ...prev, isOpen: false, countdown: OTP_EXPIRATION_TIME }));
    }, []);

    const requestOTP = async (phone: string) => {
        resetTimer();
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
                channel: 'whatsapp',
            },
        });
        if (error) throw error;
    };

    const verifyOTP = async (otp: string) => {
        const { error } = await supabase.auth.verifyOtp({
            phone: dialogState.phone,
            token: otp,
            type: 'sms',
        });
        if (error) throw error;
        dialogState.onVerified();
    };

    return (
        <OTPDialogContext.Provider value={{ ...dialogState, openOTPDialog, closeOTPDialog, requestOTP, verifyOTP }}>
            {children}
        </OTPDialogContext.Provider>
    );
};

export const useOTPDialog = () => useContext(OTPDialogContext);

export default OTPDialogContext;
