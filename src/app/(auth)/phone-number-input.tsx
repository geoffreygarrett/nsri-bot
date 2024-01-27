import {CountryCode, getCountries, getCountryCallingCode} from "libphonenumber-js";
import ReactSelect, {ActionMeta, SingleValue} from "./react-select";
import React, {ChangeEvent, FC} from "react";
import {Input} from "@/components/ui/input";

/**
 * Get the flag emoji for the country
 * @link https://dev.to/jorik/country-code-to-flag-emoji-a21
 * @param  {String} countryCode The country code
 * @return {String}             The flag emoji
 */
function getFlagEmoji(countryCode: CountryCode): string {
    let codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

type PhoneNumber = {
    country: CountryCode,
    number: string
};

type PhoneNumberInputProps = {
    value: PhoneNumber,
    onChange: (value: PhoneNumber) => void,
    onBlur: () => void,
    name: string,
    error?: string | undefined
};

type CountrySelectOptions = {
    value: CountryCode,
    label: string,
    callingCode: string
};

let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
// "United States"

export const PhoneNumberInput: FC<PhoneNumberInputProps> = ({value, onChange, onBlur, name, error}) => {
    const countryOptions: CountrySelectOptions[] = getCountries().map((country: CountryCode) => ({
        value: country,
        label: `${getFlagEmoji(country)} ${regionNames.of(country)} (+${getCountryCallingCode(country)})`,
        callingCode: `+${getCountryCallingCode(country)}`,
        chipLabel: `${getFlagEmoji(country)} +${getCountryCallingCode(country)}`
    }));

    const handleCountryChange = (newValue: SingleValue<CountrySelectOptions>, actionMeta: ActionMeta<CountrySelectOptions>) => {
        if (newValue) {
            onChange({country: newValue.value, number: value.number});
        }
    };

    const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange({country: value.country, number: event.target.value});
    };

    return (
        <div className="grid grid-cols-10 gap-2 items-end">
            <ReactSelect
                className="my-react-select-container col-span-4 relative w-full sm:text-sm text-base p-0"
                classNamePrefix="my-react-select"
                defaultValue={countryOptions.find(option => option.value === value.country)}
                options={countryOptions}
                value={countryOptions.find(option => option.value === value.country)}
                onBlur={onBlur}
                onChange={handleCountryChange}
            />
            <div className="col-span-6 h-10">
                <Input
                    className="border border-gray-300 rounded-md h-10 p-2 w-full sm:text-sm text-base"
                    placeholder="Phone number"
                    value={value.number}
                    onChange={handlePhoneNumberChange}
                    onBlur={onBlur}
                    name={name}
                    aria-label="Phone number"
                />
                {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            </div>
        </div>
    );
};
