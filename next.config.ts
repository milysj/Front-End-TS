/** @type {import('next').NextConfig} */

const nextConfig = {

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

 