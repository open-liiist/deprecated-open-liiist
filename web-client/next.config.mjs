import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntln = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntln(nextConfig);
