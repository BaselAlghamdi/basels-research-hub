import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronRight, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MaterialsPanel, MetaLine, ResearchRow } from "@/components/site/primitives";
import { fileUrl, formatDate, parseSources, researchItemQuery, researchListQuery } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/research/$slug")({
  loader: async ({ context, params }) => {
    const item = await context.queryClient.ensureQueryData(researchItemQuery(params.slug));
    if (!item) throw notFound();
    await context.queryClient.ensureQueryData(researchListQuery);
    return { item };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Research not found" }, { name: "robots", content: "noindex" }] };
    }
    const { item } = loaderData;
    const description = item.summary || item.subtitle || item.title;
    return {
      meta: [
        { title: `${item.title} — Basel M. Alghamdi` },
        { name: "description", content: description.slice(0, 158) },
        { name: "author", content: item.author },
        { property: "article:published_time", content: item.publication_date },
        { property: "og:title", content: item.title },
        { property: "og:description", content: description.slice(0, 158) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/research/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/research/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.title,
            datePublished: item.publication_date,
            author: { "@type": "Person", name: item.author },
            description,
          }),
        },
      ],
    };
  },
  component: ResearchDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <h1 className="text-2xl">Research not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This piece may have been moved or unpublished.
      </p>
      <Link to="/research" className="mt-6 inline-block text-sm text-accent hover:underline">
        Back to research library
      </Link>
    </div>
  ),
});

type Heading = { id: string; text: string; level: number };

function extractHeadings(source: string): Heading[] {
  const result: Heading[] = [];
  for (const line of (source ?? "").replace(/\r\n/g, "\n").split("\n")) {
    const match = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (!match) continue;
    const text = (match[2] ?? "").replace(/[*`_]/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    if (id) result.push({ id, text, level: (match[1] ?? "").length });
  }
  return result;
}

function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    void copy();
  };

  const base =
    "inline-flex items-center gap-2 border border-rule px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-accent hover:text-accent";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={share} className={base}>
        <Share2 className="size-3.5" /> Share
      </button>
      <button type="button" onClick={copy} className={base}>
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

function ResearchDetail() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(researchItemQuery(slug));
  const { data: all } = useSuspenseQuery(researchListQuery);

  if (!item) return null;

  const sources = parseSources(item.sources);
  const cover = fileUrl(item.cover_image_url);
  const headings = extractHeadings(item.content_md);
  const related = all
    .filter((entry) => entry.slug !== item.slug)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3 text-rule" aria-hidden="true" />
          <li>
            <Link to="/research" className="hover:text-accent">
              Research
            </Link>
          </li>
          <ChevronRight className="size-3 text-rule" aria-hidden="true" />
          <li aria-current="page" className="text-accent">
            {item.category}
          </li>
        </ol>
      </nav>

      <header className="mt-6 border-b border-rule pb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="label-eyebrow text-accent">{item.category}</span>
          {item.ticker ? (
            <span className="num text-xs text-muted-foreground">{item.ticker}</span>
          ) : null}
        </div>
        <h1 className="mt-3 max-w-4xl text-[2rem] leading-[1.12] sm:text-[2.75rem]">
          {item.title}
        </h1>
        {item.subtitle ? (
          <p className="mt-4 max-w-3xl font-serif text-lg leading-relaxed text-muted-foreground">
            {item.subtitle}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <MetaLine
            items={[
              item.author,
              formatDate(item.publication_date),
              item.reading_time ? `${item.reading_time} min read` : null,
            ]}
          />
          <ShareActions title={item.title} />
        </div>
      </header>

      {cover ? (
        <figure className="mt-10">
          <img src={cover} alt={item.title} className="w-full border border-rule" />
        </figure>
      ) : null}

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        {headings.length ? (
          <aside className="order-2 lg:order-1 lg:col-span-3">
            <nav className="lg:sticky lg:top-28" aria-label="Table of contents">
              <p className="label-eyebrow border-b border-rule pb-2 text-foreground">Contents</p>
              <ul className="mt-3 space-y-2">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                    <a
                      href={`#${heading.id}`}
                      className="block text-[0.8125rem] leading-snug text-muted-foreground transition-colors hover:text-accent"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : null}

        <div
          className={`order-1 min-w-0 lg:order-2 ${headings.length ? "lg:col-span-9" : "lg:col-span-12"}`}
        >
          {item.summary ? (
            <p className="border-l-2 border-accent pl-5 font-serif text-lg leading-relaxed text-foreground/90">
              {item.summary}
            </p>
          ) : null}

          <div className="prose-research mt-8">{renderMarkdown(item.content_md)}</div>

          <MaterialsPanel
            pdfUrl={item.pdf_url}
            pdfMeta={item.pdf_meta}
            excelUrl={item.excel_url}
            excelMeta={item.excel_meta}
            externalUrl={item.external_url}
          />

          {sources.length ? (
            <section className="mt-12">
              <h2 className="label-eyebrow border-b border-rule pb-2 text-foreground">
                Sources &amp; References
              </h2>
              <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
                {sources.map((source, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="num text-xs text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {source.label || source.url}
                      </a>
                    ) : (
                      <span>{source.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {item.tags.length ? (
            <ul className="mt-10 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-border px-2.5 py-1 text-[0.6875rem] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-16 border-t border-rule pt-8">
          <h2 className="label-eyebrow text-foreground">Related Research</h2>
          <div className="mt-4">
            {related.map((entry) => (
              <ResearchRow
                key={entry.id}
                slug={entry.slug}
                category={entry.category}
                title={entry.title}
                summary={entry.summary}
                date={entry.publication_date}
                readingTime={entry.reading_time}
                ticker={entry.ticker}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
