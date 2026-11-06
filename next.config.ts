import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente específicas do ambiente (.env.hml ou .env.prod)
const appEnv = process.env.APP_ENV;
if (appEnv) {
  dotenv.config({ path: path.resolve(process.cwd(), `.env.${appEnv}`) });
}

/** @type {import('next').NextConfig} */

const nextConfig = {

  output: 'standalone',

  eslint: {

    // ⛔ Ignora erros de ESLint durante o build (deploy não trava por causa de lint)

    ignoreDuringBuilds: true,

  },

  typescript: {

    // ⛔ Ignora erros de TypeScript durante o build

    ignoreBuildErrors: true,

  },

  async headers() {
    return [
      {
        source: '/game-pi/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, no-transform',
          },
        ],
      },
    ];
  },

};
 
module.exports = nextConfig;

 