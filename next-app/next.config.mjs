/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
    async rewrites() {
        const apiBase = process.env.API_INTERNAL_URL ?? 'http://localhost:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${apiBase}/api/:path*`,
            }
        ];
    }
};

export default nextConfig;
