import { parseLiteMarkdown } from "@/lib/markdown-lite";

export function RichText({ content }: { content: string }) {
  const blocks = parseLiteMarkdown(content);

  return (
    <div className="flex flex-col gap-4 text-zinc-400">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="text-xl font-semibold text-zinc-100">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
