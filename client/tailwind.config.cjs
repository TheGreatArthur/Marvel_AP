/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f0f12",
        ember: "#d72638",
        emberSoft: "#f25c54",
        chrome: "#f8f4ef",
        slate: "#1b1c23"
      },
      boxShadow: {
        glow: "0 0 40px rgba(215, 38, 56, 0.35)",
        card: "0 16px 40px rgba(15, 15, 18, 0.25)"
      }
    }
  },
  plugins: []
};
