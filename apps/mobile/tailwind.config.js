/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Bold/Gen-Z palette
        primary: {
          DEFAULT: "#7C3AED",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        secondary: {
          DEFAULT: "#00D9FF",
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#00D9FF",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        accent: {
          DEFAULT: "#FFE500",
          orange: "#FF5722",
          pink: "#EC4899",
        },
        background: {
          dark: "#0A0A0A",
          light: "#FAFAFA",
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
};
