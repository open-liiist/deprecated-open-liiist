import type { Config } from "tailwindcss";


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        liiist_green:  '#384000', //'#6EEB83'
        liiist_white: '#E1F2FE',
        liiist_pink: '#FFABAD',
        liiist_black: '#333333',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        noto: ['var(--font-noto_Sans)'], // Definisci `Noto Sans` per essere utilizzato con Tailwind
        sans: ['var(--font-noto_Sans)'],
      },
    },
  },
  plugins: [],
};
export default config;
