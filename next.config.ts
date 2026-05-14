import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'
import { spawnSync } from "node:child_process"

const revision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout?.trim() ?? crypto.randomUUID()

const nextConfig: NextConfig = {}

const withSerwist = withSerwistInit({
	swSrc: "src/sw.ts",
	swDest: "public/sw.js",
  	disable: process.env.NODE_ENV === "development",
	additionalPrecacheEntries: [{ url: "/~offline", revision }],
})

export default withSerwist(nextConfig)
