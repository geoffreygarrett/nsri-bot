// "use client";

// "https://wa.me/104155238886/?text=%2A%5BPNK-KMD-0052%5D%2A%0A%0A",

// https://wa.me/104155238886/?text=%2A%5BPNK-KMD-0052%5D%2A%0A%0A

const DEFAULT_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER?.replace(/[-\s\+]/g, "") || "";

const createWhatsappLink = (message: string, number: string = DEFAULT_NUMBER) => {
    console.log("message", message);
    let encodedMessage = encodeURIComponent(message);

    // Manually encode asterisks
    encodedMessage = encodedMessage.replace(/\*/g, '%2A');

    return `https://wa.me/${number}/?text=${encodedMessage}`;
}

export default createWhatsappLink