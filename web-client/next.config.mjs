import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Gestisce percorsi con prefissi di lingua
        source: '/:locale/backend/:path*',
        destination: 'http://search-service:4001/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);




