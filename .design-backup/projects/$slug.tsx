import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { MaterialsPanel, MetaLine } from "@/components/site/primitives";
import { fileUrl, formatDate, projectItemQuery } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const item = await context.queryClient.ensureQueryData(projectItemQuery(params.slug));
    if (!item) throw notFound();
    return { item };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project not found" }, { name: "robots", content: "noindex" }] };
    }
    const { item } = loaderData;
    const description = (item.summary || item.title).slice(0, 158);
    return {
      meta: [
        { title: `${item.title} — Basel M. Alghamdi` },
        { name: "description", content: description },
        { property: "og:title", content: item.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/projects/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/projects/${params.slug}` }],
    };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <h1 className="text-2xl">Project not found</h1>
      <Link to="/projects" className="mt-6 inline-block text-sm text-accent hover:underline">
        Back to projects
      </Link>
    </div>
  ),
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(projectItemQuery(slug));
  if (!item) return null;

  const cover = fileUrl(item.cover_image_url);
  const gallery = item.gallery.map((entry) => fileUrl(entry)).filter(Boolean) as string[];

  return (
    <article className="px-5 py-12 sm:px-8 sm:py-16">
      <header className="mx-auto max-w-3xl">
        <span className="label-eyebrow text-accent">{item.category}</span>
        <h1 className="mt-3 text-3xl leading-tight sm:text-[2.5rem]">{item.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{item.summary}</p>
        <div className="mt-6 border-y border-rule py-3">
          <MetaLine
            items={[formatDate(item.project_date), item.tools.length ? item.tools.join(" · ") : null]}
          />
        </div>
      </header>

      {cover ? (
        <figure className="mx-auto mt-10 max-w-4xl">
          <img src={cover} alt={item.title} className="w-full border border-border" />
        </figure>
      ) : null}

      <div className="prose-research mx-auto mt-10 max-w-3xl">{renderMarkdown(item.content_md)}</div>

      {gallery.length ? (
        <section className="mx-auto mt-12 max-w-4xl">
          <h2 className="label-eyebrow border-b border-foreground pb-2 text-foreground">
            Charts &amp; Screenshots
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {gallery.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" className="w-full border border-border" />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-3xl">
        <MaterialsPanel
          title="Project Files"
          pdfUrl={item.pdf_url}
          pdfMeta={item.pdf_meta}
          excelUrl={item.excel_url}
          excelMeta={item.excel_meta}
          externalUrl={item.external_url}
        />
      </div>
    </article>
  );
}
