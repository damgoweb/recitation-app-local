import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'base': ['18px', { lineHeight: '1.75' }],
        'lg': ['20px', { lineHeight: '1.75' }],
        'xl': ['24px', { lineHeight: '1.75' }],
        '2xl': ['28px', { lineHeight: '1.5' }],
        '3xl': ['32px', { lineHeight: '1.5' }],
      },
      spacing: {
        'tap': '44px',
      },
    },
  },
  plugins: [],
};

export default config;