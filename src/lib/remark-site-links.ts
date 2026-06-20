import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { normalizeLegacyDocPath } from "./site-paths";

type SiteLinksOptions = {
	base?: string;
};

/**
 * Prefix root-relative links with Astro `base` and normalize legacy `/docs/*`
 * or `*.mdx` paths to extensionless routes.
 */
export const remarkSiteLinks: Plugin<[SiteLinksOptions?], Root> = (options = {}) => {
	const base = normalizeBase(options.base ?? "/");

	return (tree) => {
		visit(tree, "link", (node) => {
			const raw = node.url;
			if (
				typeof raw !== "string" ||
				raw.startsWith("http://") ||
				raw.startsWith("https://") ||
				raw.startsWith("mailto:") ||
				raw.startsWith("#")
			) {
				return;
			}

			let path = raw.startsWith("/") ? normalizeLegacyDocPath(raw) : raw;

			if (path.startsWith("/")) {
				node.url = `${base}${path.slice(1)}`.replace(/\/{2,}/g, "/");
			}
		});
	};
};

function normalizeBase(value: string): string {
	if (!value || value === "/") return "/";
	return value.endsWith("/") ? value : `${value}/`;
}
