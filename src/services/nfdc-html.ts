const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: "\"",
  apos: "'",
  "#39": "'",
  lt: "<",
  gt: ">",
  ndash: "-",
  mdash: "-"
};

const decodeNumericEntity = (value: string): string => {
  const isHex = value[1]?.toLowerCase() === "x";
  const numeric = Number.parseInt(value.slice(isHex ? 2 : 1), isHex ? 16 : 10);
  return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : "";
};

export const decodeHtmlEntities = (value: string): string => {
  return value.replace(/&(#x?[0-9a-f]+|nbsp|amp|quot|apos|#39|lt|gt|ndash|mdash);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();

    if (normalized.startsWith("#")) {
      return decodeNumericEntity(normalized);
    }

    return HTML_ENTITY_MAP[normalized] ?? match;
  });
};

export const stripHtmlToText = (value: string): string => {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<(?:script|style)\b[\s\S]*?<\/(?:script|style)>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

export const collapseWhitespace = (value: string): string => {
  return stripHtmlToText(value).replace(/\s+/g, " ").trim();
};

const normalizeLabel = (value: string): string => {
  return collapseWhitespace(value)
    .toLowerCase()
    .replace(/\s*[:\-–]+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const extractTableCellPairs = (html: string): Array<{ label: string; value: string }> => {
  const pairs: Array<{ label: string; value: string }> = [];

  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)];
    if (cells.length < 2) {
      continue;
    }

    const label = normalizeLabel(cells[0][1]);
    const value = cells
      .slice(1)
      .map((cell) => collapseWhitespace(cell[1]))
      .filter(Boolean)
      .join(" ")
      .trim();

    if (label) {
      pairs.push({ label, value });
    }
  }

  return pairs;
};

export const findFirstPairValue = (
  pairs: Array<{ label: string; value: string }>,
  predicate: (label: string) => boolean
): string | null => {
  const match = pairs.find(({ label, value }) => predicate(label) && value.length > 0);
  return match?.value ?? null;
};
