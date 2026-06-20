import type { CollectionEntry } from "astro:content";
import {
	README_COLLECTION_ID,
	README_TREE_LABEL,
	dirListingHref,
	docPageHref,
} from "./site-paths";

export type DocsEntry = CollectionEntry<"docs">;

export type ContentTreeNode = {
	name: string;
	path: string;
	entry?: DocsEntry;
	children: ContentTreeNode[];
};

function insertNode(root: ContentTreeNode, segments: string[], entry: DocsEntry) {
	let node = root;
	for (let i = 0; i < segments.length; i += 1) {
		const segment = segments[i]!;
		const path = segments.slice(0, i + 1).join("/");
		let child = node.children.find((item) => item.name === segment);
		if (!child) {
			child = { name: segment, path, children: [] };
			node.children.push(child);
		}
		if (i === segments.length - 1) {
			child.entry = entry;
		}
		node = child;
	}
}

export function buildContentTree(entries: DocsEntry[]): ContentTreeNode {
	const root: ContentTreeNode = { name: "", path: "", children: [] };

	for (const entry of entries) {
		insertNode(root, entry.id.split("/"), entry);
	}

	sortTree(root);
	return root;
}

export function findNodeAtPath(
	root: ContentTreeNode,
	dirPath: string,
): ContentTreeNode | undefined {
	if (!dirPath) return root;
	let node = root;
	for (const segment of dirPath.split("/")) {
		const child = node.children.find((item) => item.name === segment);
		if (!child) return undefined;
		node = child;
	}
	return node;
}

/** Paths that should get a directory listing page (any node with children). */
export function collectDirectoryPaths(root: ContentTreeNode): string[] {
	const paths: string[] = [];
	for (const child of root.children) {
		if (child.children.length > 0) {
			paths.push(child.path);
			paths.push(...collectDirectoryPaths(child));
		}
	}
	return paths;
}

function sortNodes(nodes: ContentTreeNode[]): ContentTreeNode[] {
	return [...nodes].sort((a, b) => {
		const aOrder = a.entry?.data.order;
		const bOrder = b.entry?.data.order;
		if (aOrder != null && bOrder != null && aOrder !== bOrder) {
			return aOrder - bOrder;
		}
		return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
	});
}

function sortTree(node: ContentTreeNode) {
	node.children.sort((a, b) => {
		const aIsDir = a.children.length > 0 && !a.entry;
		const bIsDir = b.children.length > 0 && !b.entry;
		if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
		return sortNodes([a, b])[0] === a ? -1 : 1;
	});

	for (const child of node.children) {
		sortTree(child);
	}
}

/** Root-level files first, then directory branches. */
export function partitionRootNodes(nodes: ContentTreeNode[]): ContentTreeNode[] {
	const files: ContentTreeNode[] = [];
	const dirs: ContentTreeNode[] = [];
	const hybrid: ContentTreeNode[] = [];

	for (const node of nodes) {
		if (node.children.length > 0 && !node.entry) {
			dirs.push(node);
		} else if (node.entry && node.children.length === 0) {
			files.push(node);
		} else if (node.entry && node.children.length > 0) {
			hybrid.push(node);
		}
	}

	return [...sortNodes(files), ...sortNodes(dirs), ...sortNodes(hybrid)];
}

export function docHref(id: string): string {
	return docPageHref(id);
}

export type TreeLine = {
	prefix: string;
	label: string;
	href?: string;
};

function ancestorPrefix(continues: boolean[]): string {
	return continues.map((continuesLine) => (continuesLine ? "│   " : "    ")).join("");
}

type FlattenOptions = {
	/** Sibling lines appended after this level (e.g. README at repo root). */
	reservedTail?: number;
};

/** Flatten a tree into terminal-style lines with box-drawing prefixes. */
export function flattenContentTree(
	nodes: ContentTreeNode[],
	continues: boolean[] = [],
	options: FlattenOptions = {},
): TreeLine[] {
	const lines: TreeLine[] = [];
	const reservedTail = options.reservedTail ?? 0;

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i]!;
		const isLast = i === nodes.length - 1 && reservedTail === 0;
		const connector = isLast ? "└── " : "├── ";
		const prefix = ancestorPrefix(continues) + connector;

		const hasChildren = node.children.length > 0;
		const hasEntry = node.entry != null;

		if (hasChildren && !hasEntry) {
			lines.push({
				prefix,
				label: `${node.name}/`,
				href: dirListingHref(node.path),
			});
			lines.push(...flattenContentTree(node.children, [...continues, !isLast]));
			continue;
		}

		if (hasEntry) {
			lines.push({
				prefix,
				label: `${node.name}.mdx`,
				href: docHref(node.entry!.id),
			});
		}

		if (hasChildren) {
			if (hasEntry) {
				lines.push({
					prefix: ancestorPrefix([...continues, !isLast]) + "├── ",
					label: `${node.name}/`,
					href: dirListingHref(node.path),
				});
			}
			lines.push(...flattenContentTree(node.children, [...continues, !isLast]));
		}
	}

	return lines;
}

/** Home-page tree: root files, then dirs, then README.md. */
export function flattenContentTreeForDisplay(
	nodes: ContentTreeNode[],
	options: { includeReadme?: boolean } = {},
): TreeLine[] {
	const { includeReadme = true } = options;
	const ordered = partitionRootNodes(nodes);
	const lines = flattenContentTree(ordered, [], { reservedTail: includeReadme ? 1 : 0 });

	if (includeReadme) {
		lines.push({
			prefix: `${ancestorPrefix([])}└── `,
			label: README_TREE_LABEL,
			href: docPageHref(README_COLLECTION_ID),
		});
	}

	return lines;
}
