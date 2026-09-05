import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/primitives";
import { fileUrl, settingsQuery } from "@/lib/content";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume — Basel Alghamdi" },
      {
        name: "description",
        content: "View or download the current resume of Basel Alghamdi, finance student at KAU.",
      },
      { property: "og:title", content: "Resume — Basel Alghamdi" },
      { property: "og:description", content: "View or download the current resume." },
      { property: "og:url", content: "/resume" },
      { property: "og:type", content: "profile" },
    ],
    links: [{ rel: "canonical", href: "/resume" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: ResumePage,
});

function ResumePage() {
  const { data } = useSuspenseQuery(settingsQuery);
  const view = fileUrl(data.profile.resume_url);
  const download = fileUrl(data.profile.resume_url, true);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader
        eyebrow="Curriculum Vitae"
        title="Resume"
        subtitle="Current resume covering education, coursework, skills, and research work."
      />

      {view ? (
        <>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={view}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent"
            >
              View Resume
            </a>
            <a
              href={download ?? view}
              className="border border-input px-4 py-2 text-sm font-medium hover:bg-surface"
            >
              Download Resume
            </a>
          </div>
          <div className="mt-8 hidden border border-rule sm:block">
            <object data={view} type="application/pdf" className="h-[900px] w-full">
              <p className="p-6 text-sm text-muted-foreground">
                Preview unavailable in this browser. Use the buttons above.
              </p>
            </object>
          </div>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          No resume uploaded yet. Upload a PDF from the admin panel and it will appear here.
        </p>
      )}
    </div>
  );
}
