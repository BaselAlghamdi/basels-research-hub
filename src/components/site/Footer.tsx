import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { DEFAULT_PROFILE, settingsQuery } from "@/lib/content";

export function Footer() {
  const { data } = useQuery(settingsQuery);
  const profile = data?.profile ?? DEFAULT_PROFILE;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-rule bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-lg font-semibold">{profile.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Investment Research &amp; Financial Modeling
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm md:items-end">
            <div className="flex gap-6">
              <Link to="/research" className="text-muted-foreground hover:text-foreground">
                Research
              </Link>
              <Link to="/projects" className="text-muted-foreground hover:text-foreground">
                Projects
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link to="/k7m2q-desk-x8v41" className="text-muted-foreground/50 hover:text-foreground">
                Admin
              </Link>
            </div>
            <div className="flex gap-6">
              {profile.linkedin ? (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  LinkedIn
                </a>
              ) : null}
              {profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Email
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          Research and opinions published on this website are for educational and informational
          purposes only and do not constitute investment advice.
          <span className="mt-2 block">
            © {year} {profile.name}. All rights reserved.
          </span>
        </p>
      </div>
    </footer>
  );
}
