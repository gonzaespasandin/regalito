import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Imágenes de marca servidas desde el bucket de Storage `gift-images`.
        protocol: "https",
        hostname: "orapfgfohdgplfffzask.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
