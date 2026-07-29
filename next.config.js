/** @type {import('next').NextConfig} */
const hasBackendProxy = Boolean(process.env.BACKEND_BASE_URL)

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client'],
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    if (!hasBackendProxy) return []

    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/backend-proxy/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

module.exports = nextConfig
