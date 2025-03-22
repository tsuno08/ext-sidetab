/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./content.js"
  ],
  theme: {
    extend: {
      colors: {
        'sidebar-bg': '#f8fafc',
        'sidebar-border': '#e2e8f0',
        'tab-hover': '#f1f5f9',
        'tab-active': '#e2e8f0',
        'group-header': '#f1f5f9',
      },
      width: {
        'sidebar': '280px',
      },
    },
  },
  plugins: [],
} 