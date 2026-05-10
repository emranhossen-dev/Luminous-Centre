/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-450px 0' },
          '100%': { backgroundPosition: '450px 0' },
        },
        'square-tl': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(0, 117.5px)' },
          '50%': { transform: 'translate(117.5px, 117.5px)' },
          '75%': { transform: 'translate(117.5px, 0)' },
        },
        'square-bl': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(0, -117.5px)' },
          '50%': { transform: 'translate(117.5px, -117.5px)' },
          '75%': { transform: 'translate(117.5px, 0)' },
        },
        'square-tr': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-117.5px, 0)' },
          '50%': { transform: 'translate(-117.5px, 117.5px)' },
          '75%': { transform: 'translate(0, 117.5px)' },
        },
        'square-br': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-117.5px, 0)' },
          '50%': { transform: 'translate(-117.5px, -117.5px)' },
          '75%': { transform: 'translate(0, -117.5px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1) rotate(45deg)' },
          '75%': { transform: 'scale(0.25) rotate(45deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        'square-tl': 'square-tl 2.6s ease infinite',
        'square-bl': 'square-bl 2.6s ease infinite',
        'square-tr': 'square-tr 2.6s ease infinite 0.1625s',
        'square-br': 'square-br 2.6s ease infinite 0.1625s reverse',
        pulse: 'pulse 1.3s ease infinite',
      },
    },
  },
  plugins: [],
}