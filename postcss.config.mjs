/** @type {import('postcss').Config} */
const config = {
	plugins: [
		'postcss-import',
		'@tailwindcss/postcss',
		['cssnano', { preset: 'default' }],
	],
}

export default config
