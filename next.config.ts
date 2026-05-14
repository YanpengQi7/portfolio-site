import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
  // Include content/ directory in serverless function bundle for RAG
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
};

export default nextConfig;
