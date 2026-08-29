import type { ReactNode } from "react";

/**
 * Minimal, dependency-free markdown renderer tuned for research articles.
 * Supports: h1-h3, paragraphs, bold, italic, inline code, links, images,
 * bullet/numbered lists, blockquotes, tables (horizontally scrollable),
 * horizontal rules and italic-only lines used as figure captions.
 */

type Inline = { text: string };

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith("![")) {
      const m = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(token);
      if (m)
        nodes.push(
          <img
            key={key}
            src={m[2] ?? ""}
            alt={m[1] ?? ""}
            loading="lazy"
            className="my-2 w-full border border-border"
          />,
        );
    } else if (token.startsWith("[")) {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (m) {
        const external = /^https?:\/\//.test(m[2] ?? "");
        nodes.push(
          <a
            key={key}
            href={m[2] ?? "#"}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {m[1] ?? ""}
          </a>,
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return /^\s*\|?[\s:-]*-[-\s:|]*\|?\s*$/.test(line) && line.includes("-");
}

export function renderMarkdown(source: string): ReactNode[] {
  const lines = (source ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  const isImageOnly = (line: string) => /^!\[[^\]]*\]\([^)]+\)$/.test(line.trim());

  while (index < lines.length) {
    const raw = lines[index] ?? "";
    const line = raw.trim();

    if (!line) {
      index += 1;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      blocks.push(<hr key={`b${key++}`} />);
      index += 1;
      continue;
    }

    // headings
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = (heading[1] ?? "").length;
      const headingText = heading[2] ?? "";
      const content = parseInline(headingText, `b${key}`);
      const id = headingText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      if (level === 1) blocks.push(<h1 key={`b${key++}`} id={id}>{content}</h1>);
      else if (level === 2) blocks.push(<h2 key={`b${key++}`} id={id}>{content}</h2>);
      else blocks.push(<h3 key={`b${key++}`} id={id}>{content}</h3>);
      index += 1;
      continue;
    }

    // table
    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1] ?? "")) {
      const headers = splitRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && (lines[index] ?? "").trim().includes("|")) {
        rows.push(splitRow((lines[index] ?? "").trim()));
        index += 1;
      }
      blocks.push(
        <div key={`b${key++}`} className="-mx-1 overflow-x-auto py-2">
          <table>
            <thead>
              <tr>
                {headers.map((cell, i) => (
                  <th key={i} scope="col">
                    {parseInline(cell, `th${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className={c === 0 ? "" : "num"}>
                      {parseInline(cell, `td${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // blockquote
    if (line.startsWith(">")) {
      const buffer: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
        buffer.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`b${key++}`}>{parseInline(buffer.join(" "), `b${key}`)}</blockquote>,
      );
      continue;
    }

    // unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s+/.test((lines[index] ?? "").trim())) {
        items.push((lines[index] ?? "").trim().replace(/^[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`b${key++}`}>
          {items.map((item, i) => (
            <li key={i}>{parseInline(item, `ul${i}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // ordered list
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s+/.test((lines[index] ?? "").trim())) {
        items.push((lines[index] ?? "").trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`b${key++}`}>
          {items.map((item, i) => (
            <li key={i}>{parseInline(item, `ol${i}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // standalone image (figure, allowed to breathe wider)
    if (isImageOnly(line)) {
      const m = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line);
      index += 1;
      const nextLine = lines[index]?.trim() ?? "";
      let caption: string | null = null;
      if (/^\*[^*].*\*$/.test(nextLine)) {
        caption = nextLine.slice(1, -1);
        index += 1;
      }
      blocks.push(
        <figure key={`b${key++}`} className="py-3">
          <img
            src={m?.[2]}
            alt={m?.[1] ?? ""}
            loading="lazy"
            className="w-full border border-border"
          />
          {caption ? (
            <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
          ) : null}
        </figure>,
      );
      continue;
    }

    // caption line (italic only)
    if (/^\*[^*].*\*$/.test(line)) {
      blocks.push(
        <p key={`b${key++}`} className="text-sm text-muted-foreground">
          {line.slice(1, -1)}
        </p>,
      );
      index += 1;
      continue;
    }

    // paragraph
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = (lines[index] ?? "").trim();
      if (
        !current ||
        /^(#{1,3})\s+/.test(current) ||
        current.startsWith(">") ||
        /^[-*+]\s+/.test(current) ||
        /^\d+[.)]\s+/.test(current) ||
        isImageOnly(current) ||
        (current.includes("|") && isTableDivider(lines[index + 1] ?? ""))
      )
        break;
      paragraph.push(current);
      index += 1;
    }
    blocks.push(<p key={`b${key++}`}>{parseInline(paragraph.join(" "), `p${key}`)}</p>);
  }

  return blocks;
}

export function estimateReadingTime(source: string): number {
  const words = (source ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

export type { Inline };
