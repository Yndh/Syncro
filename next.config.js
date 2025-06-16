/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [
      "www.google.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
    ],
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
