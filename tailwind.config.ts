import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          night: "#0a0e17",
          panel: "rgba(15, 23, 42, 0.82)",
          panelStrong: "rgba(13, 20, 36, 0.94)",
          panelAlt: "rgba(11, 18, 32, 0.78)",
          border: "#1e293b",
          text: "#e2e8f0",
          muted: "#94a3b8",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
          cyan: "#06b6d4",
          blue: "#38bdf8",
          magenta: "#d946ef"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(30, 41, 59, 0.9), 0 18px 48px rgba(2, 6, 23, 0.48)",
        insetLine: "inset 0 1px 0 rgba(148, 163, 184, 0.06)"
      },
      backgroundImage: {
        radar:
          "radial-gradient(circle at top, rgba(6, 182, 212, 0.12), transparent 28%), linear-gradient(180deg, rgba(12, 18, 32, 0.98), rgba(10, 14, 23, 1))"
      }
    }
  },
  plugins: []
};

export default config;
