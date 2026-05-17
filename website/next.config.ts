import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/get",
        destination: "https://extension.dripwriter.org",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
