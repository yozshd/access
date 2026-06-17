import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";

export type DocEntry = CollectionEntry<"docs"> | CollectionEntry<"readme">;

export const README_DOC_ID = "readme";

export async function getDocEntry(slug: string): Promise<DocEntry | undefined> {
	if (slug === README_DOC_ID) {
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
	if (id === README_DOC_ID) return "README.md";
	const stem = id.split("/").pop() ?? id;
	return `${stem}.mdx`;
}
