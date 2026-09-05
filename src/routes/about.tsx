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
          "Basel M. Alghamdi is a finance student at King Abdulaziz University focused on investment research, equity analysis, valuation, and financial modeling.",
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
    <section className="mt-14">
      <h2 className="label-eyebrow border-b border-rule pb-2 text-foreground">{title}</h2>
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
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <PageHeader eyebrow="Profile" title="About" subtitle={profile.role} />

      <div className="mt-10 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="font-serif text-lg leading-relaxed text-foreground/90">
            {about.intro ||
              "Finance student at King Abdulaziz University with a focus on investment research, equity analysis, valuation, and financial modeling. This site collects independent research, analysis, and selected finance projects."}
          </p>
        </div>
        <div className="md:col-span-5">
          <div className="panel p-6">
            <h2 className="label-eyebrow border-b border-rule pb-2 text-foreground">
              Academic Index
            </h2>
            <p className="num mt-4 font-serif text-4xl leading-none text-accent">4.82</p>
            <p className="num mt-2 text-xs text-muted-foreground">Cumulative GPA · out of 5.00</p>
            <ul className="mt-4 border-t border-border pt-3 text-sm">
              <li className="flex justify-between gap-4 py-1.5">
                <span className="label-eyebrow text-[0.625rem]">University</span>
                <span className="text-right">King Abdulaziz University</span>
              </li>
              <li className="flex justify-between gap-4 py-1.5">
                <span className="label-eyebrow text-[0.625rem]">Major</span>
                <span>Finance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

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

      <Block title="Areas of Interest">
        <ul className="grid gap-x-6 sm:grid-cols-2">
          {interests.map((interest) => (
            <li
              key={interest}
              className="flex items-center gap-3 border-b border-border py-2.5 text-sm"
            >
              <span className="size-1 shrink-0 bg-accent" aria-hidden="true" />
              {interest}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Skills">
        {about.skills.length ? (
          <ul className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <li
                key={skill}
                className="border border-rule px-2.5 py-1 text-xs text-muted-foreground"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">To be added.</p>
        )}
      </Block>

      <Block title="Certifications">
        <CertificationsGrid />
      </Block>

      <Block title="Contact">
        <ul className="panel divide-y divide-border px-6 text-sm">
          {profile.email ? (
            <li className="flex justify-between gap-4 py-3">
              <span className="label-eyebrow text-[0.625rem]">Email</span>
              <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
                {profile.email}
              </a>
            </li>
          ) : null}
          {profile.linkedin ? (
            <li className="flex justify-between gap-4 py-3">
              <span className="label-eyebrow text-[0.625rem]">LinkedIn</span>
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
          <li className="flex justify-between gap-4 py-3">
            <span className="label-eyebrow text-[0.625rem]">Location</span>
            <span>{profile.location || "Jeddah, Saudi Arabia"}</span>
          </li>
        </ul>
      </Block>
    </div>
  );
}
