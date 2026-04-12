import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0071e3',
        'dark-100': '#86868b',
        'dark-200': '#2e2e30',
        'light-100': '#adb5bd',
      },
      fontFamily: {
        regular: '"Regular"',
        medium: '"Medium"',
        semibold: '"SemiBold"',
        bold: '"Bold"',
        extralight: '"ExtraLight"',
        overlord: '"Overlord"',
      },
      backgroundImage: {
        'gradient-custom': 'linear-gradient(to bottom right, #0894ff 0%, #c959dd 34%, #ff2e54 68%, #ff9004)',
      },
    },
  },
  plugins: [],
}
export default config
