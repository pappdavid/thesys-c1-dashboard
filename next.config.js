/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  transpilePackages: [
    '@thesysai/genui-sdk',
    '@crayonai/react-ui',
    '@crayonai/react-core',
    'react-day-picker',
  ],
};

module.exports = nextConfig;
