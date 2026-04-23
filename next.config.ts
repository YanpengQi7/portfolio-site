import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include content/ directory in serverless function bundle for RAG
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
};

export default nextConfig;
