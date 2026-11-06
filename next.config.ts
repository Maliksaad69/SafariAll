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
      {
        source: '/tours',
        destination: '/african-safari-tours',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;