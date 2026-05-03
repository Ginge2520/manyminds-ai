import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#eaf0f7",
        muted: "#9aa8b7",
        panel: "#111a24",
        rail: "#080d16",
        brand: "#7c5cff",
        aqua: "#19d3ff",
        green: "#00a884",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(25, 211, 255, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
