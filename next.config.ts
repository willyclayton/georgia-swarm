import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'img.youtube.com' },
      { hostname: 'georgiaswarm.com' },
      { hostname: 'nll.com' },
      { hostname: 'nllstatsapp.aordev.com' },
    ],
  },
};

export default nextConfig;
