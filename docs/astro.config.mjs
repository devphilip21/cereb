import { fileURLToPath } from "node:url";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const DARK_THEME = "github-dark";
const LIGHT_THEME = "github-light";

// https://astro.build/config
export default defineConfig({
  site: "https://cereb.dev",
  image: {
    service: { entrypoint: "astro/assets/services/noop" },
  },
  integrations: [
    expressiveCode({
      themes: [DARK_THEME, LIGHT_THEME],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => {
        if (theme.name === DARK_THEME) {
          return '[data-theme="dark"]';
        }
        return '[data-theme="light"]';
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
