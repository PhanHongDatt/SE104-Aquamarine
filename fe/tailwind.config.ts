import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        montserrat: ["var(--font-display)"],
      },
      colors: {
        primary: {
          DEFAULT: "#170C79",
          hover: "#1a0e8f",
          light: "#2318a8",
        },
        warm: {
          DEFAULT: "#EFE3CA",
          dark: "#e0ce9e",
        },
        accent: {
          DEFAULT: "#56B6C6",
          hover: "#45a5b5",
          light: "#6fc5d4",
        },
        soft: {
          DEFAULT: "#8ACBD0",
          light: "#b0dfe3",
        },
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(23,12,121,0.07)",
        "card-hover": "0 4px 24px 0 rgba(23,12,121,0.13)",
        glow: "0 0 0 3px rgba(138,203,208,0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
