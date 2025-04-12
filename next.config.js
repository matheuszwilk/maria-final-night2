/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.0.247",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "192.168.0.247",
        port: "3001",
      },
    ],
  },
  // typescript: {
  //   // !! WARN !!
  //   // Dangerously allow production builds to successfully complete even if
  //   // your project has type errors.
  //   // !! WARN !!
  //   ignoreBuildErrors: true,
  // },
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  server: {
    // Fixes "Socket already assigned" error
    compression: false,
    maxHeaderSize: 16384, // 16KB
    keepAliveTimeout: 60000, // 60 seconds
  },
};

module.exports = nextConfig;
