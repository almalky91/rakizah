import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure standalone output mode for Hostinger deployment
  // This creates a self-contained build with all dependencies
  output: 'standalone',

  // Webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  },

  // Image optimization configuration
  images: {
    // Add external image domains here if needed
    // Example: domains: ['example.com', 'cdn.example.com'],
    domains: [],
    
    // Configure image formats
    formats: ['image/avif', 'image/webp'],
    
    // Disable image optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // TypeScript configuration
  typescript: {
    // Run type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Run ESLint during build
    ignoreDuringBuilds: false,
  },

  // Experimental features (if needed in the future)
  experimental: {
    // Enable server actions if needed
    // serverActions: true,
  },

  // Environment variables that should be available on the client side
  // Note: Use NEXT_PUBLIC_ prefix in .env for client-side variables
  env: {},
};

export default nextConfig;
