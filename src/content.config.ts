import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Filesystem root for the glob loader — not Astro `site` / `base` (see astro.config.mjs). */
const docs = defineCollection({
	loader: glob({ base: "./src/content/docs", pattern: "**/*.{md,mdx}" }),
	schema: z.looseObject({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().optional(),
	}),
});

/** Repo-root README.md — collection id `readme` → `/README.md`. See site-paths.ts. */
const readme = defineCollection({
	loader: glob({
		base: ".",
		pattern: "README.md",
		generateId: () => "readme",
	}),
	schema: z.looseObject({
		title: z.string().optional(),
		description: z.string().optional(),
	}),
});

export const collections = { docs, readme };
