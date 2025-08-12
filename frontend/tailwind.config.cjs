/**** TailwindCSS Config ****/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: '#00f0ff',
        neonMagenta: '#ff00ff'
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)'
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 20% 20%, rgba(0,240,255,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,0,255,0.15), transparent 40%)'
      }
    }
  },
  plugins: []
}