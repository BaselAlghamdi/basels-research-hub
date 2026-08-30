import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, Menu, X } from "lucide-react";
import { useState } from "react";

const SOCIALS = [
  {
    href: "https://www.linkedin.com/in/imbasel",
    label: "LinkedIn",
    Icon: Linkedin,
    external: true,
  },
  {
    href: "mailto:baselmsalghamdi@gmail.com",
    label: "Email",
    Icon: Mail,
    external: false,
  },
] as const;

const NAV = [
  { to: "/", label: "Home" },
  { to: "/research", label: "Research" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/resume", label: "Resume" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-serif text-[1.0625rem] font-semibold tracking-tight">
            Basel M. Alghamdi
          </span>
          <span className="label-eyebrow mt-1 hidden text-[0.625rem] sm:block">
            Investment Research &amp; Financial Modeling
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.slice(1).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2">
          {SOCIALS.map(({ href, label, Icon, external }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="flex size-8 items-center justify-center border border-input text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </a>
          ))}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="-mr-2 p-2 text-foreground md:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-rule bg-background md:hidden" aria-label="Mobile">
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {NAV.map((item) => (
              <li key={item.to} className="border-b border-border last:border-0">
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-foreground"
                  activeProps={{ className: "font-semibold" }}
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
