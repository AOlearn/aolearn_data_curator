export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#1a1a1a',
          800: '#2a2a2a',
          700: '#3a3a3a',
        },
        orange: {
          500: '#ff8c00',
          600: '#e07b00',
          700: '#c06a00',
        },
      },
    },
  },
  plugins: [],
};