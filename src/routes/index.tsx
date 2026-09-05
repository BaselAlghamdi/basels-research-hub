import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { ProjectRow, ResearchRow, SectionTitle } from "@/components/site/primitives";
import { projectsListQuery, researchListQuery, settingsQuery } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basel Alghamdi — Investment Research & Financial Modeling" },
      {
        name: "description",
        content:
          "Independent investment research, equity analysis, valuation work and financial models by Basel Alghamdi, finance student at King Abdulaziz University.",
      },
      {
        property: "og:title",
        content: "Basel Alghamdi — Investment Research & Financial Modeling",
      },
      {
        property: "og:description",
        content:
          "Independent research, investment analysis, financial models and selected finance projects.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(researchListQuery),
      context.queryClient.ensureQueryData(projectsListQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]);
  },
  component: HomePage,
});

/** Decorative editorial line — not market data. */
function DecorativeLine() {
  const points = [4, 18, 12, 26, 22, 38, 34, 52, 48, 66, 74];
  const step = 100 / (points.length - 1);
  const path = points
    .map((value, index) => `${index === 0 ? "M" : "L"} ${(index * step).toFixed(2)} ${(80 - value).toFixed(2)}`)
    .join(" ");
  const area = `${path} L 100 80 L 0 80 Z`;

  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      className="h-24 w-full"
    >
      {[20, 40, 60].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--rule)" strokeWidth="0.3" />
      ))}
      <path d={area} fill="var(--accent)" opacity="0.08" />
      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function IndexRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="label-eyebrow text-[0.625rem]">{label}</span>
      <span className="num text-right text-sm text-foreground">{value}</span>
    </li>
  );
}

function HomePage() {
  const { data: research } = useSuspenseQuery(researchListQuery);
  const { data: projects } = useSuspenseQuery(projectsListQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);

  const latest = research.slice(0, 4);
  const featured =
    [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))[0] ?? null;
  const others = [...projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(1, 4);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="rise grid gap-12 border-b border-rule py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="label-eyebrow text-accent">
            {settings.profile.role || "Finance Student · Investment Research"}
          </p>
          <h1 className="mt-5 text-[2.75rem] leading-[1.05] sm:text-6xl">
            {settings.profile.name}
          </h1>
          <p className="mt-6 max-w-xl font-serif text-xl leading-relaxed text-foreground/90">
            Finance student focused on investment research, valuation, and financial modeling.
          </p>
          <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
            This site collects my independent research, investment analysis, financial models, and
            selected finance projects. Work published here is prepared for study and discussion,
            with methodology and sources stated so that conclusions can be examined rather than
            taken on trust.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/research"
              className="bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Read Research
            </Link>
            <Link
              to="/projects"
              className="border border-rule px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-accent hover:text-accent"
            >
              Project Book
            </Link>
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="panel glow-accent p-6">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h2 className="label-eyebrow text-foreground">Academic Index</h2>
              <span className="label-eyebrow text-[0.5625rem] text-accent">Current</span>
            </div>

            <p className="num mt-5 font-serif text-5xl leading-none text-accent">4.82</p>
            <p className="num mt-2 text-xs text-muted-foreground">Cumulative GPA · out of 5.00</p>

            <div className="mt-5 border-y border-border py-2">
              <DecorativeLine />
            </div>

            <ul className="mt-4">
              <IndexRow label="University" value="King Abdulaziz University" />
              <IndexRow label="Major" value="Finance" />
              <IndexRow label="Focus" value="Research · Valuation · Modeling" />
              <IndexRow
                label="Location"
                value={settings.profile.location || "Jeddah, Saudi Arabia"}
              />
            </ul>
          </div>
        </aside>
      </section>

      <section className="py-16">
        <SectionTitle
          title="Latest Research"
          action={
            <Link
              to="/research"
              className="label-eyebrow text-[0.625rem] text-accent hover:underline"
            >
              All research
            </Link>
          }
        />
        {latest.length ? (
          <div className="mt-8">
            {latest.map((item) => (
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
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">No research published yet.</p>
        )}
      </section>

      <section className="pb-20">
        <SectionTitle
          title="Featured Project"
          action={
            <Link
              to="/projects"
              className="label-eyebrow text-[0.625rem] text-accent hover:underline"
            >
              Project book
            </Link>
          }
        />

        {featured ? (
          <div className="mt-8 grid gap-8 md:grid-cols-12">
            <article className="panel p-7 md:col-span-7">
              <span className="label-eyebrow text-accent">{featured.category}</span>
              <h3 className="mt-3 text-2xl leading-snug">
                <Link
                  to="/projects/$slug"
                  params={{ slug: featured.slug }}
                  className="transition-colors hover:text-accent"
                >
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                {featured.summary}
              </p>
              {featured.tools.length ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {featured.tools.map((tool) => (
                    <li
                      key={tool}
                      className="border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                to="/projects/$slug"
                params={{ slug: featured.slug }}
                className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent hover:underline"
              >
                Open project <ArrowRight className="size-3.5" />
              </Link>
            </article>

            {others.length ? (
              <div className="grid gap-6 md:col-span-5">
                {others.map((project) => (
                  <ProjectRow
                    key={project.id}
                    slug={project.slug}
                    category={project.category}
                    title={project.title}
                    summary={project.summary}
                    date={project.project_date}
                    tools={project.tools}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">No projects published yet.</p>
        )}
      </section>
    </div>
  );
}
