/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
      "clsx",
      "tailwind-merge",
      "react-spinners",
    ],
  },
  async redirects() {
    return [
      {
        source: "/financial-goals",
        destination: "/goals",
        permanent: true,
      },
      {
        source: "/dashboard/goals",
        destination: "/goals",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
