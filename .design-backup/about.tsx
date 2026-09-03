import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CertificationsGrid } from "@/components/site/Certifications";
import { PageHeader } from "@/components/site/primitives";
import { settingsQuery } from "@/lib/content";
import { certificationsQuery } from "@/lib/certifications";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Basel M. Alghamdi" },
      {
        name: "description",
        content:
          "Basel M. Alghamdi is a finance student focused on investment research, equity analysis, valuation, and financial modeling.",
      },
      { property: "og:title", content: "About — Basel M. Alghamdi" },
      {
        property: "og:description",
        content: "Finance student focused on investment research, valuation, and financial modeling.",
      },
      { property: "og:url", content: "/about" },
      { property: "og:type", content: "profile" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(certificationsQuery),
    ]);
  },
  component: AboutPage,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="label-eyebrow border-b border-foreground pb-2 text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AboutPage() {
  const { data } = useSuspenseQuery(settingsQuery);
  const { profile, about } = data;

  const interests = about.interests.length
    ? about.interests
    : [
        "Investment Research",
        "Equity Analysis",
        "Asset Management",
        "Valuation",
        "Financial Modeling",
        "Capital Markets",
      ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader eyebrow="Profile" title="About" subtitle={profile.role} />

      <Block title={profile.name}>
        <p className="text-base leading-relaxed text-muted-foreground">
          {about.intro ||
            "Finance student at King Abdulaziz University with a focus on investment research, equity analysis, valuation, and financial modeling. This site collects independent research, analysis, and selected finance projects."}
        </p>
      </Block>

      <Block title="Areas of Interest">
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {interests.map((interest) => (
            <li key={interest} className="border-b border-border py-2 text-sm">
              {interest}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Education">
        {about.education.length ? (
          <ul className="divide-y divide-border">
            {about.education.map((entry, index) => (
              <li key={index} className="flex flex-wrap justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium">{entry.credential}</p>
                  <p className="text-sm text-muted-foreground">{entry.institution}</p>
                  {entry.detail ? (
                    <p className="mt-1 text-xs text-muted-foreground">{entry.detail}</p>
                  ) : null}
                </div>
                <span className="num text-xs text-muted-foreground">{entry.period}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            King Abdulaziz University — Finance. Details to be added.
          </p>
        )}
      </Block>

      <Block title="Certifications">
        <CertificationsGrid />
      </Block>


      <Block title="Skills">
        {about.skills.length ? (
          <ul className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <li key={skill} className="border border-border px-2.5 py-1 text-xs">
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">To be added.</p>
        )}
      </Block>

      <Block title="Contact">
        <ul className="divide-y divide-border text-sm">
          {profile.email ? (
            <li className="flex justify-between gap-4 py-3">
              <span className="text-muted-foreground">Email</span>
              <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
                {profile.email}
              </a>
            </li>
          ) : null}
          {profile.linkedin ? (
            <li className="flex justify-between gap-4 py-3">
              <span className="text-muted-foreground">LinkedIn</span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {profile.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </li>
          ) : null}
          {profile.location ? (
            <li className="flex justify-between gap-4 py-3">
              <span className="text-muted-foreground">Location</span>
              <span>{profile.location}</span>
            </li>
          ) : null}
        </ul>
      </Block>
    </div>
  );
}
