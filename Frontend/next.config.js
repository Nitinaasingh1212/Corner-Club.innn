/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: "export", // Disabled to allow proxy rewrites
    // eslint config removed (handled in package.json or separate config)
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
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
        const apiUrl = process.env.API_URL || 'https://corner-club-innn.onrender.com';
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
            // Proxy websocket/socket.io if needed later
        ];
    },
};

module.exports = nextConfig;
