import {useOTPDialog} from '@/providers/otp-provider';

export const useOTPProcess = () => {
    const {requestOTP, verifyOTP, openOTPDialog} = useOTPDialog();

    const initiateOTPRequest = async (phone: string) => {
        try {
            await requestOTP(phone);
            openOTPDialog({
                message: "Enter OTP", phone: phone, onVerified: () => {
                }
            })
            // Handle OTP request success
        } catch (error: any) {
            console.error('OTP Request Failed:', error.message);
            // Handle OTP request error
        }
    };

    const initiateOTPVerification = async (otp: string) => {
        try {
            await verifyOTP(otp);
            // Handle OTP verification success
        } catch (error: any) {
            console.error('OTP Verification Failed:', error.message);
            // Handle OTP verification error
        }
    };

    return {initiateOTPRequest, initiateOTPVerification};
};
