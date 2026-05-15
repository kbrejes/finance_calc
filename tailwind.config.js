/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#FAFAFA",
        muted: {
          DEFAULT: "#737373",
          foreground: "#A1A1A1",
        },
        border: "#2A2A2A",
        input: "#141414",
      },
    },
  },
  plugins: [],
}
