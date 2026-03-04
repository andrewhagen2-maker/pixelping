import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: "#1a0e00",
          panel: "#2d1a00",
          border: "#7a4a00",
          accent: "#d4820a",
          gold: "#f5a623",
          cream: "#f5e6c8",
          orange: "#c8580a",
          red: "#8b1a00",
          green: "#2a6e00",
          darkbrown: "#0d0700",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        mono: ["Courier New", "Courier", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
