/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          squid: "#232f3e",
          anchor: "#0073bb",
          orange: "#ff9900",
          smile: "#146eb4",
          dark: "#0f172a",
          card: "#1e293b",
          border: "#334155"
        }
      }
    },
  },
  plugins: [],
}
