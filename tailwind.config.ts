import { allThemes, defaultTheme, safeThemeList } from "./themes";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const themer = require("tailwindcss-themer");

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: safeThemeList,
  theme: {
    extend: {
      /* colors */
      colors: {
        "bink-100": "#432449",
        "bink-200": "#412B57",
        "bink-300": "#533670",
        "bink-400": "#714C97",
        "bink-500": "#8D66B5",
        "bink-600": "#A87FD1",
        "bink-700": "#CD97D6",
        "denim-100": "#120F1D",
        "denim-200": "#191526",
        "denim-300": "#211D30",
        "denim-400": "#2B263D",
        "denim-500": "#38334A",
        "denim-600": "#504B64",
        "denim-700": "#7A758F",
        "ash-600": "#817998",
        "ash-500": "#9C93B5",
        "ash-400": "#3D394D",
        "ash-300": "#2C293A",
        "ash-200": "#2B2836",
        "ash-100": "#1E1C26"
      },

      /* breakpoints */
      screens: {
        ssm: "400px",
        '2xl': '1921px', // Custom breakpoint for screens at least 1920px wide
        '3xl': '2650px', // Custom breakpoint for screens at least 2650px wide
        '4xl': '3840px', // Custom breakpoint for screens at least 4096px wide
      },

      /* fonts */
      fontFamily: {
        "main": "'DM Sans'", // "main": "'Open Sans'",
        "open-sans": "'Open Sans'"
      },

      /* animations */
      keyframes: {
        "loading-pin": {
          "0%, 40%, 100%": { height: "0.5em", "background-color": "#282336" },
          "20%": { height: "1em", "background-color": "white" },
        },
      },
      animation: { "loading-pin": "loading-pin 1.8s ease-in-out infinite" },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    themer({
      defaultTheme: defaultTheme,
    }),
    plugin(({ addVariant }) => {
      addVariant("dir-neutral", "[dir] &");
    }),
  ],
};

export default config;
