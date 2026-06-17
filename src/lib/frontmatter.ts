/** Serialize frontmatter data as YAML (without `---` fences). */
export function formatFrontmatterYaml(data: unknown, indent = 0): string {
	const pad = "  ".repeat(indent);

	if (data === null || data === undefined) return "";
	if (typeof data !== "object") return `${pad}${String(data)}`;

	if (Array.isArray(data)) {
		return data
			.map((item) => {
				if (item !== null && typeof item === "object" && !Array.isArray(item)) {
					const lines = formatFrontmatterYaml(item, indent + 1)
						.split("\n")
						.filter(Boolean);
					if (lines.length === 0) return `${pad}-`;
					return `${pad}-\n${lines.map((line) => `  ${line}`).join("\n")}`;
				}
				return `${pad}- ${formatScalar(item)}`;
			})
			.join("\n");
	}

	return Object.entries(data as Record<string, unknown>)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => {
			if (value !== null && typeof value === "object") {
				const nested = formatFrontmatterYaml(value, indent + 1);
				return nested ? `${pad}${key}:\n${nested}` : `${pad}${key}:`;
			}
			return `${pad}${key}: ${formatScalar(value)}`;
		})
		.join("\n");
}

function formatScalar(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") {
		if (/[:#{}[\],&*?|>!%@`"']/.test(value) || value.includes("\n")) {
			return JSON.stringify(value);
		}
		return value;
	}
	return String(value);
}

export function frontmatterYamlBlock(data: Record<string, unknown>): string {
	const body = formatFrontmatterYaml(data);
	return body ? `---\n${body}\n---` : "";
}
