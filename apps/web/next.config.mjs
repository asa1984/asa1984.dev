/** @type {import('next').NextConfig} */
const next_config = {
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8787",
      },
      {
        protocol: "https",
        hostname: "api.asa1984.dev",
      },
    ],
  },
};

export default next_config;
