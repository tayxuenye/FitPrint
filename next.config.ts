import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for transformers.js - client-side only
    if (!isServer) {
      // Provide fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        os: false,
        tty: false,
        net: false,
        child_process: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
      };

      // Ignore Node.js modules that transformers.js might try to use
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp': false,
        'canvas': false,
      };

      // Ignore warnings about require() in transformers.js
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /node_modules\/@xenova\/transformers/ },
      ];
    }

    // Only externalize server-only packages on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'sharp': 'commonjs sharp',
        'canvas': 'commonjs canvas',
      });
    }

    return config;
  },
  // External packages for server components only
  serverExternalPackages: ['@xenova/transformers'],
  // Add turbopack config to silence warning (webpack is used for transformers.js)
  turbopack: {},
};

export default nextConfig;
