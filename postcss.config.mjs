/** @type {import('postcss').Config} */
const config = {
  plugins: [
    'postcss-import',
    '@tailwindcss/postcss',               
    'autoprefixer',               
    ['cssnano', { preset: 'default' }], 
  ],
}

export default config
