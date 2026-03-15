/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0B0C11",
        surface: "#151821",
        "surface-soft": "#1A1E28",
        "surface-strong": "#211A17",
        border: "#2B3040",
        text: "#F8FAFC",
        muted: "#94A3B8",
        "muted-strong": "#CBD5E1",
        "accent-start": "#FF7A00",
        "accent-end": "#FF2D20",
        accent: "#FF5A00",
        success: "#22C55E",
        warning: "#FDB022",
        danger: "#F04438",
      },
      boxShadow: {
        glow: "0 14px 48px rgba(255, 90, 0, 0.28)",
        card: "0 20px 40px rgba(5, 8, 16, 0.32)",
      },
      borderRadius: {
        xl: 20,
        "2xl": 24,
        "3xl": 32,
      },
      fontSize: {
        hero: ["40px", { lineHeight: "48px", fontWeight: "800" }],
      },
    },
  },
  plugins: [],
};
