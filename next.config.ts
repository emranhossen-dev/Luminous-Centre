/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co.com', // Keep your existing one for the dashboard
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co', // Add this one for the logo
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
