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
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loop-media.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.debatuwikilehaj.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'iidmc.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
