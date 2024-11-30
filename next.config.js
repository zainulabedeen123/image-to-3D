/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    FAL_KEY: process.env.FAL_KEY,
  },
  typescript: {
    // We're handling TypeScript errors in development
    ignoreBuildErrors: true,
  },
  eslint: {
    // We're handling ESLint errors in development
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 