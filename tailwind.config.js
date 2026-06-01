/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        creeper: {
          50:    '#eaffea',
          green: '#54a832',
          dark:  '#3b7a22',
          light: '#7ed957',
          face:  '#1a3d12',
        },
        night: {
          900: '#0b160a',
          800: '#12230f',
          700: '#1b3416',
        },
        tnt:  '#d83c2c',
        gold: '#f5c542',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body:  ['Inter', 'sans-serif'],
      },
      keyframes: {
        screenShake: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '20%':      { transform: 'translate(-8px, 4px)' },
          '40%':      { transform: 'translate(8px, -4px)' },
          '60%':      { transform: 'translate(-6px, 6px)' },
          '80%':      { transform: 'translate(6px, -6px)' },
        },
      },
      animation: {
        screenShake: 'screenShake 0.5s ease',
      },
    },
  },
  plugins: [],
}
