// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE,
	base: process.env.ASTRO_BASE,
	integrations: [mdx()],
	markdown: {
		// Plain fenced blocks (GitHub-style), not Shiki token spans.
		syntaxHighlight: false,
		// Enables remark-gfm: tables, task lists, strikethrough, autolinks, footnotes.
		gfm: true,
	},
	vite: {
      resolve: {
          alias: {
              "~": fileURLToPath(new URL("./src", import.meta.url)),
          },
      },

      plugins: [tailwindcss()],
    },
});