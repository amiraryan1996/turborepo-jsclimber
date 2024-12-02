import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config();

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/ui"],
  env: {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    WEBHOOKS_SECRET: process.env.WEBHOOKS_SECRET,
  },
};

export default nextConfig;
