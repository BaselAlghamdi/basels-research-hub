import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

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
        Back to the project book
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
            <Link to="/projects" className="hover:text-accent">
              Projects
            </Link>
          </li>
          <ChevronRight className="size-3 text-rule" aria-hidden="true" />
          <li aria-current="page" className="text-accent">
            {item.category}
          </li>
        </ol>
      </nav>

      <header className="mt-6 border-b border-rule pb-6">
        <span className="label-eyebrow text-accent">{item.category}</span>
        <h1 className="mt-3 max-w-4xl text-[2rem] leading-[1.12] sm:text-[2.75rem]">
          {item.title}
        </h1>
        <p className="mt-4 max-w-3xl font-serif text-lg leading-relaxed text-muted-foreground">
          {item.summary}
        </p>
        <div className="mt-6">
          <MetaLine items={[formatDate(item.project_date)]} />
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <aside className="order-2 lg:order-1 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            {item.tools.length ? (
              <div className="panel p-6">
                <h2 className="label-eyebrow border-b border-rule pb-2 text-foreground">
                  Tools &amp; Methods
                </h2>
                <ul className="mt-3">
                  {item.tools.map((tool) => (
                    <li
                      key={tool}
                      className="border-b border-border py-2 text-sm text-muted-foreground last:border-0"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <MaterialsPanel
              title="Project Files"
              pdfUrl={item.pdf_url}
              pdfMeta={item.pdf_meta}
              excelUrl={item.excel_url}
              excelMeta={item.excel_meta}
              externalUrl={item.external_url}
            />
          </div>
        </aside>

        <div className="order-1 min-w-0 lg:order-2 lg:col-span-8">
          {cover ? (
            <figure className="mb-10">
              <img src={cover} alt={item.title} className="w-full border border-rule" />
            </figure>
          ) : null}

          <div className="prose-research">{renderMarkdown(item.content_md)}</div>

          {gallery.length ? (
            <section className="mt-12">
              <h2 className="label-eyebrow border-b border-rule pb-2 text-foreground">
                Charts &amp; Screenshots
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {gallery.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-full border border-rule"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
