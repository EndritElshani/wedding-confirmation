 /** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/wedding-confirmation',
    assetPrefix: '/wedding-confirmation/',
    images: {
      unoptimized: true,
    },
    // This is important for GitHub Pages
    trailingSlash: true,
  }
  
  module.exports = nextConfig