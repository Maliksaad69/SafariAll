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
      {
        source: '/operators',
        destination: '/safari-operators',
        permanent: true,
      },
      {
        source: '/reviews',
        destination: '/safari-reviews',
        permanent: true,
      },
      {
        source: '/blogs',
        destination: '/safari-blog',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/safari-blog',
        permanent: true,
      },
      {
        source: '/blogs/:slug',
        destination: '/safari-blog/:slug',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/safari-blog/:slug',
        permanent: true,
      },
      {
        source: '/quote/request',
        destination: '/custom-safari-quote',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;