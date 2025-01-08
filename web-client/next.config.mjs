import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://auth-service:4000/:path*', // Proxy alle API del backend senza /api
            },
        ];
    },
};

export default withNextIntl(nextConfig);
