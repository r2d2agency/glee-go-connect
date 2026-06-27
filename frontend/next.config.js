/** @type {import('next').NextConfig} */
const BIO_DOMAIN = process.env.NEXT_PUBLIC_BIO_DOMAIN || 'bio.gleego.com.br';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        // bio.gleego.com.br/<slug>  ->  /c/<slug>
        {
          source: '/:slug((?!_next|api|c|auth|dashboard|admin|onboarding|favicon|assets|uploads|robots\\.txt|sitemap\\.xml).+)',
          has: [{ type: 'host', value: BIO_DOMAIN }],
          destination: '/c/:slug',
        },
      ],
    };
  },
};
module.exports = nextConfig;
