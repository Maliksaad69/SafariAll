import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/parks',
        destination: '/top-safari-countries',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;