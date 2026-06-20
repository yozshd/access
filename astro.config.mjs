// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { remarkSiteLinks } from "./src/lib/remark-site-links.ts";

const siteBase = process.env.ASTRO_BASE ?? "/";

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE,
	base: siteBase,
	trailingSlash: "never",
	build: {
		format: "directory",
	},
	redirects: {
		"/README.md": "/readme",
	},
	integrations: [mdx()],
	markdown: {
		// Plain fenced blocks (GitHub-style), not Shiki token spans.
		syntaxHighlight: false,
		// Enables remark-gfm: tables, task lists, strikethrough, autolinks, footnotes.
		gfm: true,
		remarkPlugins: [[remarkSiteLinks, { base: siteBase }]],
	},
	vite: {
		define: {
			"import.meta.env.BASE": JSON.stringify(siteBase),
		},
		resolve: {
			alias: {
				"~": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},

		plugins: [tailwindcss()],
	},
});