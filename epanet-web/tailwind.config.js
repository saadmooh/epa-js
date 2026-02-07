/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        epanet: {
          primary: '#0066CC',
          secondary: '#00AA44',
          accent: '#FF6600',
          danger: '#CC0000',
          warning: '#FFAA00',
          info: '#0099CC',
        },
        network: {
          junction: '#0066CC',
          reservoir: '#00AA44',
          tank: '#0099CC',
          pipe: '#666666',
          pump: '#FF6600',
          valve: '#CC00CC',
          selected: '#FF0000',
          hovered: '#FFFF00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
