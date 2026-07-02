import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light admin theme (public menu uses direct neutral-* classes so it's unaffected)
        canvas: "#FAFAFA",   // page bg
        surface: "#FFFFFF",  // card bg
        elevated: "#F3F4F6", // hover / subtle
        line: "#E5E7EB",     // borders
        focus: "#9CA3AF",    // focus ring
        fg: "#111827",       // primary text
        muted: "#6B7280",    // secondary text
        dim: "#9CA3AF",      // tertiary text
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
