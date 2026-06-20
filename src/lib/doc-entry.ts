import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";
import {
	README_COLLECTION_ID,
	README_ROUTE_SLUG,
	README_TREE_LABEL,
} from "./site-paths";

export type DocEntry = CollectionEntry<"docs"> | CollectionEntry<"readme">;

export { README_COLLECTION_ID, README_ROUTE_SLUG, README_TREE_LABEL };

export async function getDocEntry(slug: string): Promise<DocEntry | undefined> {
	if (slug === README_COLLECTION_ID) {
		return getEntry("readme", slug);
	}
	return getEntry("docs", slug);
}

export function docPageTitle(entry: DocEntry): string {
	if (entry.data.title) return entry.data.title;
	if (entry.collection === "readme") return "README";
	return entry.id;
}

/** Tree-style filename for breadcrumbs and content list. */
export function docFilename(id: string): string {
	if (id === README_COLLECTION_ID) return README_TREE_LABEL;
	const stem = id.split("/").pop() ?? id;
	return `${stem}.mdx`;
}
