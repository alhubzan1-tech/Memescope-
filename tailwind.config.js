/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#0f1419',
        'darker': '#0a0e13',
        'card': '#1a1f2e',
        'accent': '#00d084',
        'accent-red': '#ff4757',
      },
    },
  },
  plugins: [],
};
