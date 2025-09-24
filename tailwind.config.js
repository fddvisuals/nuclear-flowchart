/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fuel-production': '#00558C',
        'fuel-weaponization': '#1E1E1E',
        'operational': '#C7E9C0',
        'unknown': '#BCD8F0',
        'construction': '#DCCCFF',
        'likely-destroyed': '#FFE0C2',
        'destroyed': '#FFC7C2',
      }
    },
  },
  plugins: [],
}