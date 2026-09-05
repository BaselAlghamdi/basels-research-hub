import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader, ProjectRow } from "@/components/site/primitives";
import { PROJECT_CATEGORIES, projectsListQuery } from "@/lib/content";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Project Book — Basel Alghamdi" },
      {
        name: "description",
        content:
          "Financial modeling, valuation, equity research, and academic finance projects by Basel Alghamdi.",
      },
      { property: "og:title", content: "Project Book — Basel Alghamdi" },
      {
        property: "og:description",
        content: "Financial modeling, valuation, equity research, and academic finance projects.",
      },
      { property: "og:url", content: "/projects" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsListQuery),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const { data: projects } = useSuspenseQuery(projectsListQuery);
  const [active, setActive] = useState<string>("All");

  const available = [
    "All",
    ...PROJECT_CATEGORIES.filter((category) => projects.some((p) => p.category === category)),
  ];

  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [projects, active],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader
        eyebrow="Work"
        title="Project Book"
        subtitle="Financial models, valuation work, equity research reports, and selected university projects."
      />

      {projects.length ? (
        <>
          <nav className="mt-8 -mx-1 overflow-x-auto" aria-label="Project categories">
            <ul className="flex min-w-max gap-1 px-1 py-1">
              {available.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => setActive(category)}
                    aria-pressed={active === category}
                    className={`border px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active === category
                        ? "border-accent text-accent"
                        : "border-rule text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {filtered.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
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
          ) : (
            <div className="panel mt-10 p-10 text-center">
              <p className="label-eyebrow text-foreground">No results</p>
              <p className="mt-3 text-sm text-muted-foreground">
                No projects in this category yet.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">No projects published yet.</p>
      )}
    </div>
  );
}
