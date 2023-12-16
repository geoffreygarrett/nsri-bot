/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        domains: ['localhost', '192.168.68.126']
    },
}

module.exports = nextConfig
