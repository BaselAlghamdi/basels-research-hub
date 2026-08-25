import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader, ResearchRow } from "@/components/site/primitives";
import { RESEARCH_CATEGORIES, researchListQuery } from "@/lib/content";

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

  const available = ["All", ...RESEARCH_CATEGORIES.filter((category) =>
    research.some((item) => item.category === category),
  )];

  const filtered = active === "All" ? research : research.filter((i) => i.category === active);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader
        eyebrow="Library"
        title="Research & Insights"
        subtitle="Independent research, investment analysis, company research, and market commentary."
      />

      <nav className="mt-6 -mx-1 overflow-x-auto" aria-label="Research categories">
        <ul className="flex min-w-max gap-1 px-1 py-1">
          {available.map((category) => (
            <li key={category}>
              <button
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={active === category}
                className={
                  active === category
                    ? "border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-input hover:text-foreground"
                }
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10">
        {filtered.length ? (
          filtered.map((item) => (
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
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No research in this category yet.</p>
        )}
      </div>
    </div>
  );
}
