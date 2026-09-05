import { Link } from "@tanstack/react-router";
import { Linkedin } from "lucide-react";
import { useState } from "react";

import { EmailButton } from "@/components/site/EmailButton";

const SOCIALS = [
  {
    href: "https://www.linkedin.com/in/imbasel",
    label: "LinkedIn",
    Icon: Linkedin,
  },
] as const;

const NAV = [
  { to: "/", label: "Home" },
  { to: "/research", label: "Research" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/resume", label: "Resume" },
] as const;

const iconButton =
  "flex size-8 items-center justify-center border border-rule text-muted-foreground transition-colors hover:border-accent hover:text-accent";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-background/95 backdrop-blur">
      {/* Utility bar — desktop only */}
      <div className="hidden border-b border-rule/60 md:block">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-5 sm:px-8">
          <p className="label-eyebrow text-[0.625rem]">
            Investment Research <span className="px-1.5 text-rule">·</span> Valuation
            <span className="px-1.5 text-rule">·</span> Financial Modeling
          </p>
          <p className="label-eyebrow text-[0.625rem] text-foreground/70">Basel Alghamdi</p>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex min-w-0 flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="truncate font-serif text-[1.0625rem] font-semibold tracking-tight">
            Basel Alghamdi
          </span>
          <span className="label-eyebrow mt-1 text-[0.5625rem]">
            Finance Student <span className="text-rule">·</span> Investment Research
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.slice(1).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="label-eyebrow text-[0.6875rem] transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className={iconButton}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </a>
          ))}
          <EmailButton className={iconButton} />
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-1 flex size-8 flex-col items-center justify-center gap-[5px] text-foreground md:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className={`block h-px w-5 bg-current transition-transform duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-rule bg-surface md:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {NAV.map((item) => (
              <li key={item.to} className="border-b border-border last:border-0">
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="label-eyebrow block py-4 text-[0.75rem] text-foreground"
                  activeProps={{ className: "text-accent" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
