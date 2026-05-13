import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Snacksby',
		short_name: 'Snacksby',
		description: 'Collaborative meal planning for couples and families',
		start_url: '/',
		display: 'standalone',
		background_color: '#fff8f0',
		theme_color: '#f6a6a1',
		icons: [
			{
				src: '/images/web-app-manifest-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'maskable',
			},
			{
				src: '/images/web-app-manifest-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	}
}
