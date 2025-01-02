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
        liiist_green: '#384000',
        liiist_white: '#F9FAFB',
        liiist_pink: '#FFABAD',
        liiist_black: '#333333',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        noto: ['var(--font-noto_Sans)'],
        sans: ['var(--font-noto_Sans)'],
      },
      spacing: {
        navbar: '64px', // Altezza navbar dinamica
      },
    },
  },
  plugins: [],
};

export default config;
