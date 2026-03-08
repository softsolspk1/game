import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    dark: "#1e0521",
                    mid: "#3b0d2c",
                },
                accent: {
                    magenta: "#7b1fa2",
                    pink: "#f8c8dc",
                    gold: "#d4af37",
                    "gold-glow": "#fdfd96",
                },
            },
            fontFamily: {
                heading: ["Outfit", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
