import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

const withSerwist = withSerwistInit({
	swSrc: "src/sw.ts",
	swDest: "public/sw.js",
  	disable: process.env.NODE_ENV === "development"
})

export default withSerwist(nextConfig)
