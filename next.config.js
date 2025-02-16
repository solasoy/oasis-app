/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['uoyycrbkhuxrmvbankvj.supabase.co'], // Allow Supabase storage domain
  },
}

module.exports = nextConfig 