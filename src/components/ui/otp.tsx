import React, {forwardRef, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length: number;
    className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = forwardRef<HTMLInputElement, OtpInputProps>(
    ({value, onChange, length, className}, ref) => {
        const [inputFields, setInputFields] = useState(new Array(length).fill(""));
        const inputRefs = useRef(new Array(length).fill(React.createRef()));

        useEffect(() => {
            // if (!value) return;
            console.log(value);
            const newValues = value.split("").concat(new Array(length - value.length).fill(""));
            setInputFields(newValues);
        }, [value, length]);

        useEffect(() => {
            inputRefs.current[0].focus();
        }, []);

        const handleInputChange = (digit: string, idx: number) => {
            const numericDigit = digit.replace(/[^\d]/g, '');

            const newInputFields = [...inputFields];
            newInputFields[idx] = numericDigit.slice(-1);
            setInputFields(newInputFields);

            onChange(newInputFields.join(""));
            console.log(newInputFields.join(""));

            if (idx < length - 1 && numericDigit) {
                inputRefs.current[idx + 1].focus();
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
            if (e.key === 'Backspace' && idx > 0 && !inputFields[idx]) {
                inputRefs.current[idx - 1].focus();
            }
        };

        const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/[^\d]/g, '');
            const lengthDiff = length - inputFields.length;

            if (pastedData.length <= length) {
                const newInputFields = pastedData.split("").concat(new Array(length - pastedData.length).fill(""));
                setInputFields(newInputFields);
                onChange(newInputFields.join(""));
                inputRefs.current[
                    (lengthDiff + pastedData.length) < length ? lengthDiff + pastedData.length : length - 1
                    ].focus();
            }
        };

        return (
            <div className={cn("flex space-x-2 w-full", className)} onPaste={handlePaste}>
                {inputFields.map((digit, idx) => (
                    <input
                        key={idx}
                        name={`digit-${idx}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="\d{1}"
                        maxLength={1}
                        className="otp-input w-12 h-12 text-2xl text-center border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                        value={digit}
                        onChange={(e) => handleInputChange(e.target.value, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        ref={(el) => inputRefs.current[idx] = el}
                    />
                ))}
            </div>
        );
    }
)

OtpInput.displayName = "OtpInput"