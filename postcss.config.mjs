import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssImport from 'postcss-import'

const config = {
  plugins: [
    postcssImport,
    tailwindcss,
    autoprefixer,
    cssnano({
      preset: 'default',
    }),
  ],
}

export default config
