import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, ProjectRow } from "@/components/site/primitives";
import { PROJECT_CATEGORIES, projectsListQuery } from "@/lib/content";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Basel M. Alghamdi" },
      {
        name: "description",
        content:
          "Financial modeling, valuation, equity research, and academic finance projects by Basel M. Alghamdi.",
      },
      { property: "og:title", content: "Projects — Basel M. Alghamdi" },
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

  const groups = PROJECT_CATEGORIES.map((category) => ({
    category,
    items: projects.filter((project) => project.category === category),
  })).filter((group) => group.items.length);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader
        eyebrow="Work"
        title="Projects"
        subtitle="Financial models, valuation work, equity research reports, and selected university projects."
      />

      {groups.length ? (
        groups.map((group) => (
          <section key={group.category} className="mt-12">
            <h2 className="label-eyebrow border-b border-foreground pb-2 text-foreground">
              {group.category}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((project) => (
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
        ))
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">No projects published yet.</p>
      )}
    </div>
  );
}
