export const sanitizeDescription = (value?: string | null) => {
  if (!value) return undefined;

  return value
    .replace(/<br\s*\/?\>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/[`*_~]/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
};

export const sanitizeSearchTerm = (value?: string | null, maxLength = 60) => {
  if (!value) return undefined;

  const normalized = value.normalize("NFKC").replace(/\s+/g, " ").trim();

  if (!normalized) return undefined;

  return normalized.slice(0, maxLength);
};
