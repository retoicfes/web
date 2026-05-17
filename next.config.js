
/**@type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  output: "export",
  // ApexCharts falla con doble montaje de Strict Mode (elDefs.node null en dev).
  reactStrictMode: false,
  trailingSlash: true,
  // swcMinify: false,
  basePath:"",
  assetPrefix:"",
  images: {
    loader: "imgix",
    path: "/",
  },
};

module.exports = nextConfig;
