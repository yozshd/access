/**
 * Path helpers for access.github.io.
 *
 * Paired with `trailingSlash: "never"` in astro.config.mjs.
 *
 * ## Docs library (`src/content/docs/**`)
 *
 * - **Page URL:** `{base}{route slug}` — e.g. `/about`, `/notes/gfm-syntax`
 * - **Directory listing:** `{base}{dirPath}` — e.g. `/notes`
 *
 * ## README exception
 *
 * Repo-root `README.md` → `/readme` (tree label {@link README_TREE_LABEL}).
 *
 * ## Index doc exception
 *
 * `README.md` at the project root is not under `content/docs`. It keeps the source
 * `.md` extension in the pretty-printed URL instead of the `.mdx` convention above:
 *
 * - **Page URL:** `{base}README.md` — e.g. `/access/README.md`
 * - **Astro route param:** `README.md`
 * - **Collection entry id:** `readme` ({@link README_DOC_ID})
 * - **Tree label:** `README.md` (see `docFilename` in doc-entry.ts)
 *
 * No content transformation — only the URL segment differs from the docs library rule.
 * 
 * `{base}` is the ContentList home (`index.html`). Static hosts also map `{base}index`
 * to that file, so `index.mdx` cannot use `/index`. It routes to {@link INDEX_ROUTE_SLUG}
 * while the tree label stays `index.mdx`.
 */

/** `readme` collection entry id (repo-root README.md). */
export const README_COLLECTION_ID = "readme";

/** URL path segment for the repo-root README page. */
export const README_ROUTE_SLUG = "readme";

/** Tree/breadcrumb label for repo-root README (filename at repo root). */
export const README_TREE_LABEL = "README.md";

/** Docs collection entry id for `src/content/docs/index.mdx`. */
export const INDEX_DOC_ID = "index";

/** Public URL segment for the index doc (not `index` — clashes with home `index.html`). */
export const INDEX_ROUTE_SLUG = "entry";

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
	if (entryId === INDEX_DOC_ID) {
		return INDEX_ROUTE_SLUG;
	}
	return entryId;
}

/** Resolve a `[...slug]` param back to a collection entry id, if recognized. */
export function docIdFromRouteSlug(routeSlug: string): string | undefined {
	if (routeSlug === README_ROUTE_SLUG) {
		return README_COLLECTION_ID;
	}
	if (routeSlug === INDEX_ROUTE_SLUG) {
		return INDEX_DOC_ID;
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
	} else if (
		normalized === "/index" ||
		normalized === "/index/" ||
		normalized === "/index.mdx"
	) {
		normalized = `/${INDEX_ROUTE_SLUG}`;
	} else if (normalized.endsWith(".mdx")) {
		normalized = normalized.slice(0, -".mdx".length);
		if (normalized === "/index") {
			normalized = `/${INDEX_ROUTE_SLUG}`;
		}
	} else if (normalized.endsWith(".md")) {
		normalized = normalized.slice(0, -".md".length);
	}

	return `${normalized}${hash}`;
}
