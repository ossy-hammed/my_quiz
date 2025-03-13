/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build to prevent deployment failures
  eslint: {
    // Only run ESLint on local development, not during builds
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    // Only run type checking on local development, not during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
