export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}