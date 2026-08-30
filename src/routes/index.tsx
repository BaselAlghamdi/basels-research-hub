import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ProjectRow, ResearchRow, SectionTitle } from "@/components/site/primitives";
import { projectsListQuery, researchListQuery, settingsQuery } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basel M. Alghamdi — Investment Research & Financial Modeling" },
      {
        name: "description",
        content:
          "Independent investment research, equity analysis, valuation work and financial models by Basel M. Alghamdi, finance student at King Abdulaziz University.",
      },
      {
        property: "og:title",
        content: "Basel M. Alghamdi — Investment Research & Financial Modeling",
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

function HomePage() {
  const { data: research } = useSuspenseQuery(researchListQuery);
  const { data: projects } = useSuspenseQuery(projectsListQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);

  const latest = research.slice(0, 4);
  const selected = [...projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="grid gap-10 border-b border-rule py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-8">
          <p className="label-eyebrow">{settings.profile.role}</p>
          <h1 className="mt-4 text-4xl leading-[1.15] sm:text-5xl">{settings.profile.name}</h1>
          <p className="mt-5 max-w-2xl font-serif text-xl leading-relaxed text-foreground/90">
            Finance student focused on investment research, valuation, and financial modeling.
          </p>
          <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">
            This site contains my independent research, investment analysis, financial models, and
            selected finance projects. Work published here is prepared for study and discussion,
            with methodology and sources stated so that conclusions can be examined rather than
            taken on trust.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/research"
              className="bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
            >
              View Research
            </Link>
            <Link
              to="/projects"
              className="border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
            >
              View Projects
            </Link>
          </div>
        </div>

        <aside className="md:col-span-4 md:border-l md:border-rule md:pl-8">
          <h2 className="label-eyebrow">Coverage</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {[
              "Equity research & company analysis",
              "Valuation and financial modeling",
              "Industry and macro commentary",
            ].map((item) => (
              <li key={item} className="py-2.5 text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="py-14">
        <SectionTitle
          title="Latest Research"
          action={
            <Link to="/research" className="text-xs font-medium text-accent hover:underline">
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

      <section className="pb-16">
        <SectionTitle
          title="Selected Projects"
          action={
            <Link to="/projects" className="text-xs font-medium text-accent hover:underline">
              All projects
            </Link>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((project) => (
            <ProjectRow
              key={project.id}
              slug={project.slug}
              category={project.category}
              title={project.title}
              summary={project.summary}
              date={project.project_date}
              tools={project.tools}
              image={project.cover_image_url}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
