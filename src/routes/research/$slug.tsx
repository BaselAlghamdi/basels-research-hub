import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

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

function ResearchDetail() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(researchItemQuery(slug));
  const { data: all } = useSuspenseQuery(researchListQuery);

  if (!item) return null;

  const sources = parseSources(item.sources);
  const cover = fileUrl(item.cover_image_url);
  const related = all
    .filter((entry) => entry.slug !== item.slug)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3);

  return (
    <article className="px-5 py-12 sm:px-8 sm:py-16">
      <header className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="label-eyebrow text-accent">{item.category}</span>
          {item.ticker ? (
            <span className="num text-xs text-muted-foreground">{item.ticker}</span>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl leading-tight sm:text-[2.5rem]">{item.title}</h1>
        {item.subtitle ? (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{item.subtitle}</p>
        ) : null}
        <div className="mt-6 border-y border-rule py-3">
          <MetaLine
            items={[
              item.author,
              formatDate(item.publication_date),
              item.reading_time ? `${item.reading_time} min read` : null,
            ]}
          />
        </div>
      </header>

      {cover ? (
        <figure className="mx-auto mt-10 max-w-4xl">
          <img src={cover} alt={item.title} className="w-full border border-border" />
        </figure>
      ) : null}

      <div className="prose-research mx-auto mt-10 max-w-3xl">{renderMarkdown(item.content_md)}</div>

      <div className="mx-auto max-w-3xl">
        <MaterialsPanel
          pdfUrl={item.pdf_url}
          pdfMeta={item.pdf_meta}
          excelUrl={item.excel_url}
          excelMeta={item.excel_meta}
          externalUrl={item.external_url}
        />

        {sources.length ? (
          <section className="mt-12">
            <h2 className="label-eyebrow border-b border-foreground pb-2 text-foreground">
              Sources &amp; References
            </h2>
            <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
              {sources.map((source, index) => (
                <li key={index} className="flex gap-3">
                  <span className="num text-xs">{String(index + 1).padStart(2, "0")}</span>
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
                className="border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {related.length ? (
        <section className="mx-auto mt-16 max-w-3xl border-t border-rule pt-8">
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
