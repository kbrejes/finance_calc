/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#FFFFFF",
        primary: "#334155", // Heavy Steel Slate
        "primary-foreground": "#FFFFFF",
        success: "#10B981",
        danger: "#F43F5E",
        warning: "#F59E0B",
        muted: "#262626",
        "muted-foreground": "#A3A3A3",
        border: "#1A1A1A",
        input: "#0F0F0F",
        card: "#0A0A0A",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}
