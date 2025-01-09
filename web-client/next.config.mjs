// // next.config.mjs


// web-client/src/next.config.mjs

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            // Riscrittura per le rotte con prefisso di locale
            {
                source: '/:locale(en|pt-BR)/auth/:path*',
                destination: 'http://auth-service:4000/auth/:path*',
            },
            {
                source: '/:locale(en|pt-BR)/users/:path*',
                destination: 'http://auth-service:4000/users/:path*',
            },
            // Riscrittura per le rotte senza prefisso di locale
            {
                source: '/auth/:path*',
                destination: 'http://auth-service:4000/auth/:path*',
            },
            {
                source: '/users/:path*',
                destination: 'http://auth-service:4000/users/:path*',
            },
        ];
    },
    // Rimuovi o commenta la sezione i18n se presente
    // i18n: {
    //     locales: ['en', 'pt-BR'],
    //     defaultLocale: 'en',
    // },
    // Altre configurazioni Next.js...
};

export default withNextIntl(nextConfig);

// import createNextIntlPlugin from 'next-intl/plugin';

// const withNextIntl = createNextIntlPlugin();

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     async rewrites() {
//         return [
//             // Riscrittura per le rotte con prefisso di locale
//             {
//                 source: '/:locale(en|pt-BR)/auth/:path*',
//                 destination: 'http://auth-service:4000/auth/:path*',
//             },
//             // Riscrittura per le rotte senza prefisso di locale
//             {
//                 source: '/auth/:path*',
//                 destination: 'http://auth-service:4000/auth/:path*',
//             },
//         ];
//     },
//     // Altre configurazioni Next.js...
// };

// export default withNextIntl(nextConfig);
