/**
 * Path helpers for access.github.io.
 *
 * Routing contract (paired with `trailingSlash: "never"`):
 *
 * - **Page URL:** `{base}{entry.id}` — e.g. `/about`, `/notes/gfm-syntax`, `/readme`
 * - **Directory listing:** `{base}{dirPath}` — e.g. `/notes`
 * - **Astro route param:** `{entry.id}` via {@link routeSlugForDocId}
 *
 * Docs use extensionless URLs. Repo-root README uses `/readme`; the tree shows {@link README_TREE_LABEL}.
 */

/** `readme` collection entry id (repo-root README.md). */
export const README_COLLECTION_ID = "readme";

/** URL path segment for the repo-root README page. */
export const README_ROUTE_SLUG = "readme";

/** Tree/breadcrumb label for repo-root README (filename at repo root). */
export const README_TREE_LABEL = "README.md";

/** Root-relative page path for a collection entry id (no `base` prefix). */
export function docPathForEntryId(entryId: string): string {
	return `/${routeSlugForDocId(entryId)}`;
}

/** Join path segments under the Astro `base` (e.g. `/access/` on GitHub Pages). */
export function sitePath(...segments: string[]): string {
	const base = normalizeBase(import.meta.env.BASE ?? "/");
	const rest = segments.filter(Boolean).join("/");
	if (!rest) return base;
	return `${base}${rest}`.replace(/\/{2,}/g, "/");
}

function normalizeBase(value: string): string {
	if (!value || value === "/") return "/";
	return value.endsWith("/") ? value : `${value}/`;
}

/** Page href for a docs or readme collection entry id. */
export function docPageHref(entryId: string): string {
	return sitePath(routeSlugForDocId(entryId));
}

/** Directory listing URL — must match `trailingSlash: "never"`. */
export function dirListingHref(dirPath: string): string {
	if (!dirPath) return sitePath("");
	return sitePath(dirPath);
}

/** Astro `[...slug]` param for a routable entry id. */
export function routeSlugForDocId(entryId: string): string {
	return entryId;
}

/** Resolve a `[...slug]` param back to a collection entry id, if recognized. */
export function docIdFromRouteSlug(routeSlug: string): string | undefined {
	if (routeSlug === README_ROUTE_SLUG) {
		return README_COLLECTION_ID;
	}
	if (routeSlug.includes(".")) {
		return undefined;
	}
	return routeSlug;
}

/** Strip legacy `.mdx` / `.md` suffixes and old `/docs/*` paths. */
export function normalizeLegacyDocPath(path: string): string {
	const hashIndex = path.indexOf("#");
	const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
	const pathPart = hashIndex >= 0 ? path.slice(0, hashIndex) : path;

	if (!pathPart.startsWith("/")) {
		return path;
	}

	let normalized = pathPart;
	if (normalized.startsWith("/docs/")) {
		normalized = `/${normalized.slice("/docs/".length)}`;
	}
	if (
		normalized === "/readme.mdx" ||
		normalized === "/README.md" ||
		normalized === "/README.mdx"
	) {
		normalized = `/${README_ROUTE_SLUG}`;
	} else if (normalized.endsWith(".mdx")) {
		normalized = normalized.slice(0, -".mdx".length);
	} else if (normalized.endsWith(".md")) {
		normalized = normalized.slice(0, -".md".length);
	}

	return `${normalized}${hash}`;
}
