// utils/getBaseURL.ts

/**
 * Checks if the environment is a server or not
 */
const IS_SERVER = typeof window === "undefined";

import ip from "ip";
import axios from "axios";

export async function getExternalIp() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        console.log("Your external IP:", response.data.ip);
        return response.data.ip;
    } catch (error) {
        console.error("Could not fetch external IP:", error);
        return null;
    }
}



/**
 * Function to get the base URL based on environment variables
 *
 * The function first checks if it's running on the server or the client (browser).
 * On the server, it uses NEXT_PUBLIC_SITE_URL environment variable as the base URL.
 * On the client, it uses window.location.origin as the base URL.
 *
 * If the above checks fail, it then checks for NEXT_PUBLIC_URL, NODE_ENV, and NEXT_PUBLIC_VERCEL environment variables.
 * If NODE_ENV is "development" or NEXT_PUBLIC_VERCEL is not set to "1", the default URL is used as the base URL.
 * If NODE_ENV is not "development" and NEXT_PUBLIC_VERCEL is set to "1", it uses NEXT_PUBLIC_VERCEL_URL environment variable as the base URL.
 *
 * @returns {string} The base URL for the app
 */
export const getBaseUrl = (): string => {
    // Destructure environment variables
    const {
        NODE_ENV,
        NEXT_PUBLIC_URL,
        NEXT_PUBLIC_SITE_URL,
        VERCEL,
        NEXT_PUBLIC_VERCEL_URL,
    } = process.env;

    // console.log("NODE_ENV", NODE_ENV);
    // console.log("IS_SERVER", IS_SERVER);
    // console.log("NEXT_PUBLIC_URL", NEXT_PUBLIC_URL);
    // console.log("NEXT_PUBLIC_SITE_URL", NEXT_PUBLIC_SITE_URL);
    // console.log("VERCEL", VERCEL);
    // console.log("NEXT_PUBLIC_VERCEL_URL", NEXT_PUBLIC_VERCEL_URL);

    // Default URL, used for both development and when environment variables are not defined
    // const defaultUrl = "http://localhost:3000";
    // const defaultUrl = "http://localhost:3000";
    const defaultUrl = `http://${ip.address()}:3000`;
    // const defaultUrl = `http://${await getExternalIp()}:8080`;

    // If NEXT_PUBLIC_VERCEL is "1", return NEXT_PUBLIC_VERCEL_URL as the base URL
    if (VERCEL === "1") {
        return `https://${NEXT_PUBLIC_VERCEL_URL}`;
    }

    // If running on the server, return NEXT_PUBLIC_SITE_URL as the base URL
    if (IS_SERVER && NEXT_PUBLIC_SITE_URL) {
        return NEXT_PUBLIC_SITE_URL;
    }

    // If running on the client, return window.location.origin as the base URL
    if (!IS_SERVER) {
        return window.location.origin;
    }

    // If NEXT_PUBLIC_URL env var is defined, return it as the base URL
    if (NEXT_PUBLIC_SITE_URL) {
        return NEXT_PUBLIC_SITE_URL;
    }

    // If NODE_ENV is "development", return the default URL
    if (NODE_ENV === "development") {
        return defaultUrl;
    }

    // If none of the above conditions are met, return the default URL
    return defaultUrl;
};
