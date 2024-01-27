import {CountryCode, format, parse} from "libphonenumber-js";

export const formatPhone = (number: string, country: CountryCode) => {
    return format(parse(number, country as CountryCode), 'E.164')
}