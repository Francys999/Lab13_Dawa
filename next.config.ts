import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",   // para Google
      "avatars.githubusercontent.com" // para GitHub
    ],
  },
};

export default nextConfig;
