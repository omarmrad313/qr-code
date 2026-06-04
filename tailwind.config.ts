import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0A0A0A",
        surface: "#111111",
        elevated: "#161616",
        line: "#222222",
        focus: "#2A2A2A",
        fg: "#FFFFFF",
        muted: "#A1A1A1",
        dim: "#6B6B6B",
        gold: "#C99852",
        "gold-soft": "#D9B070",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      letterSpacing: {
        tightish: "-0.01em",
        tighter2: "-0.02em",
      },
    },
  },
  plugins: [],
};
export default config;
