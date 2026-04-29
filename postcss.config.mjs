/** @type {import('postcss').Config} */
const config = {
	plugins: [
		'@tailwindcss/postcss',
		['cssnano', { preset: 'default' }],
	],
}

export default config
