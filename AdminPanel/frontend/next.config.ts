import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled to allow proxy rewrites
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      // Proxy websocket/socket.io if needed later
    ];
  },
};

export default nextConfig;
