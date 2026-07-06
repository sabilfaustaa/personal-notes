import type { Config } from "tailwindcss";
import { appleNotesPreset } from "@apple-notes/config/tailwind";

const config: Config = {
  presets: [appleNotesPreset as Partial<Config>],
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "../packages/shared/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
};

export default config;
