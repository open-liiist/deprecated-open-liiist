import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css", // Percorso per gli stili

  ],
  theme: {
    extend: {
      colors: {
        liiist_green: '#384000',
        liiist_white: '#F9FAFB',
        liiist_pink: '#FFABAD',
        liiist_black: '#333333',
        list_light_blue: '#e2e8f0',
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
