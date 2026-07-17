// Zeer beperkte opmaak voor door de beheerder bewerkbare lange tekst (juridische pagina's):
// "## " voor een subkop, "- " voor een lijst-item, blanco regel = nieuwe alinea.
// Bewust geen volwaardige markdown-library — dit is de enige opmaak die deze site nodig heeft.
export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

export function parseLiteMarkdown(source: string): ContentBlock[] {
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) {
        return { type: "heading", text: block.slice(3).trim() };
      }

      const lines = block.split("\n").map((line) => line.trim());
      if (lines.every((line) => line.startsWith("- "))) {
        return { type: "list", items: lines.map((line) => line.slice(2).trim()) };
      }

      return { type: "paragraph", text: block };
    });
}
