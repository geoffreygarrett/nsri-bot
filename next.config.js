/** @type {import('next').NextConfig} */
const nextConfig = {
    profiler: true,
    trailingSlash: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "localhost",
            },
            {
                protocol: "http",
                hostname: "192.168.68.126",
            },
        ],

        dangerouslyAllowSVG: true,
        // domains: [
        //     'localhost',
        //     '192.168.68.126',
        //     'www.nsri.bot/*',
        //     'qlbsphcwgftiwfswxgrs.supabase.co',
        //     'nsri.bot/*'],
    },
    reactStrictMode: false,


}

module.exports = nextConfig
