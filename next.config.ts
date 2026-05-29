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

};
 
module.exports = nextConfig;

 