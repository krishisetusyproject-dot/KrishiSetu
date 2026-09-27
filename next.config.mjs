/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide Next.js server header
  poweredByHeader: false,

  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Strip console.log in production builds
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Image optimization: serve avif/webp, cache for a week
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    minimumCacheTTL: 604800, // 7 days
  },

  // Tree-shake lucide-react barrel imports — the only package that benefits
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
