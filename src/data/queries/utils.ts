export const sanitizeDescription = (value?: string | null) => {
  if (!value) return undefined;

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
};
