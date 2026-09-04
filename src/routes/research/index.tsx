import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader, ResearchRow } from "@/components/site/primitives";
import { RESEARCH_CATEGORIES, researchListQuery } from "@/lib/content";

const PAGE_SIZE = 8;

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research & Insights — Basel M. Alghamdi" },
      {
        name: "description",
        content:
          "Independent research, investment analysis, company research, and market commentary by Basel M. Alghamdi.",
      },
      { property: "og:title", content: "Research & Insights — Basel M. Alghamdi" },
      {
        property: "og:description",
        content:
          "Independent research, investment analysis, company research, and market commentary.",
      },
      { property: "og:url", content: "/research" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/research" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(researchListQuery),
  component: ResearchIndex,
});

function ResearchIndex() {
  const { data: research } = useSuspenseQuery(researchListQuery);
  const [active, setActive] = useState<string>("All");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  const available = [
    "All",
    ...RESEARCH_CATEGORIES.filter((category) => research.some((i) => i.category === category)),
  ];

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return research.filter((item) => {
      if (active !== "All" && item.category !== active) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.ticker ?? "").toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [research, active, term]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader
        eyebrow="Library"
        title="Research & Insights"
        subtitle="Independent research, investment analysis, company research, and market commentary."
      />

      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <label className="relative block">
              <span className="sr-only">Search research</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Search research"
                className="w-full border border-rule bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </label>

            <h2 className="label-eyebrow mt-8 border-b border-rule pb-2 text-foreground">
              Categories
            </h2>
            <ul className="mt-2 flex flex-wrap gap-1 md:flex-col md:gap-0">
              {available.map((category) => (
                <li key={category} className="md:w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(category);
                      setPage(1);
                    }}
                    aria-pressed={active === category}
                    className={`w-full border px-3 py-2 text-left text-xs font-medium uppercase tracking-[0.1em] transition-colors md:border-0 md:border-b md:border-border ${
                      active === category
                        ? "border-accent text-accent md:border-b-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="md:col-span-9">
          {visible.length ? (
            <>
              <div>
                {visible.map((item) => (
                  <ResearchRow
                    key={item.id}
                    slug={item.slug}
                    category={item.category}
                    title={item.title}
                    summary={item.summary}
                    date={item.publication_date}
                    readingTime={item.reading_time}
                    ticker={item.ticker}
                    image={item.cover_image_url}
                  />
                ))}
              </div>

              {pages > 1 ? (
                <nav
                  className="mt-10 flex items-center justify-between border-t border-rule pt-5"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                    className="border border-rule px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-rule disabled:hover:text-foreground"
                  >
                    Previous
                  </button>
                  <span className="num text-xs text-muted-foreground">
                    Page {current} of {pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={current === pages}
                    className="border border-rule px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-rule disabled:hover:text-foreground"
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </>
          ) : (
            <div className="panel p-10 text-center">
              <p className="label-eyebrow text-foreground">No results</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {term
                  ? `Nothing matches “${term}” in this category.`
                  : "No research in this category yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
