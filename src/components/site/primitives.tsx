import { Link } from "@tanstack/react-router";
import { ArrowRight, FileSpreadsheet, FileText } from "lucide-react";
import type { ReactNode } from "react";

import { fileUrl, formatDate } from "@/lib/content";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="border-b border-rule pb-8">
      {eyebrow ? <p className="label-eyebrow text-accent">{eyebrow}</p> : null}
      <h1 className="mt-3 text-[2.25rem] leading-[1.1] sm:text-5xl">{title}</h1>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-rule pb-2">
      <h2 className="label-eyebrow flex items-center gap-2 text-foreground">
        <span className="size-1 bg-accent" aria-hidden="true" />
        {title}
      </h2>
      {action}
    </div>
  );
}

export function MetaLine({ items }: { items: (string | null | undefined)[] }) {
  const parts = items.filter(Boolean) as string[];
  return (
    <p className="num text-xs text-muted-foreground">
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 ? <span className="px-2 text-rule">·</span> : null}
          {part}
        </span>
      ))}
    </p>
  );
}

export function ResearchRow({
  slug,
  category,
  title,
  summary,
  date,
  readingTime,
  ticker,
  image,
}: {
  slug: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readingTime?: number | null;
  ticker?: string | null;
  image?: string | null;
}) {
  const cover = fileUrl(image);
  return (
    <article className="group border-b border-border py-7 first:pt-0">
      <div className="flex flex-col gap-5 sm:flex-row-reverse sm:items-start sm:justify-between">
        {cover ? (
          <Link
            to="/research/$slug"
            params={{ slug }}
            className="block w-full shrink-0 sm:w-48 md:w-56"
          >
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="aspect-[16/10] w-full border border-border object-cover"
            />
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="label-eyebrow text-accent">{category}</span>
            {ticker ? <span className="num text-xs text-muted-foreground">{ticker}</span> : null}
          </div>
          <h3 className="mt-2 text-xl leading-snug">
            <Link
              to="/research/$slug"
              params={{ slug }}
              className="transition-colors hover:text-accent"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">
            {summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <MetaLine
              items={[formatDate(date), readingTime ? `${readingTime} min read` : null]}
            />
            <Link
              to="/research/$slug"
              params={{ slug }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              Read Research <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectRow({
  slug,
  category,
  title,
  summary,
  date,
  tools,
  image,
}: {
  slug: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  tools: string[];
  image?: string | null;
}) {
  const cover = fileUrl(image);
  return (
    <article className="flex h-full flex-col border border-rule bg-card p-6 transition-colors hover:border-accent">
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="mb-5 aspect-[16/9] w-full border border-border object-cover"
        />
      ) : null}
      <span className="label-eyebrow text-accent">{category}</span>
      <h3 className="mt-2 text-lg leading-snug">
        <Link to="/projects/$slug" params={{ slug }} className="hover:text-accent">
          {title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {summary}
      </p>
      {tools.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tools.map((tool) => (
            <li
              key={tool}
              className="border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
            >
              {tool}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <MetaLine items={[formatDate(date)]} />
        <Link
          to="/projects/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
        >
          View Project <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function MaterialsPanel({
  pdfUrl,
  pdfMeta,
  excelUrl,
  excelMeta,
  externalUrl,
  title = "Research Materials",
}: {
  pdfUrl?: string | null;
  pdfMeta?: string | null;
  excelUrl?: string | null;
  excelMeta?: string | null;
  externalUrl?: string | null;
  title?: string;
}) {
  const pdf = fileUrl(pdfUrl);
  const pdfDownload = fileUrl(pdfUrl, true);
  const excel = fileUrl(excelUrl, true);

  if (!pdf && !excel && !externalUrl) return null;

  return (
    <section className="mt-8 border border-rule bg-surface p-6">
      <h2 className="label-eyebrow text-foreground">{title}</h2>
      <ul className="mt-4 divide-y divide-border">
        {pdf ? (
          <li className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Full Research Report</p>
                <p className="num text-xs text-muted-foreground">{pdfMeta || "PDF document"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-input px-3 py-1.5 text-xs font-medium hover:bg-background"
              >
                View PDF
              </a>
              <a
                href={pdfDownload ?? pdf}
                className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent"
              >
                Download
              </a>
            </div>
          </li>
        ) : null}

        {excel ? (
          <li className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="mt-0.5 size-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Financial Model</p>
                <p className="num text-xs text-muted-foreground">
                  {excelMeta || "Excel workbook"}
                </p>
              </div>
            </div>
            <a
              href={excel}
              className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent"
            >
              Download Model
            </a>
          </li>
        ) : null}

        {externalUrl ? (
          <li className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-start gap-3">
              <ArrowRight className="mt-0.5 size-4 text-accent" />
              <p className="text-sm font-medium">External link</p>
            </div>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-input px-3 py-1.5 text-xs font-medium hover:bg-background"
            >
              Open
            </a>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
