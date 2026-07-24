/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No `images.remotePatterns` on purpose: the only remote image is the GitHub
  // avatar and it's rendered `unoptimized`, so the Image Optimizer is never
  // asked to fetch a remote host.
};

export default nextConfig;
