import { useQuery } from "@tanstack/react-query";

import {
  certificationStatus,
  certificationsQuery,
  safeExternalUrl,
  type Certification,
} from "@/lib/certifications";
import { fileUrl, formatDate } from "@/lib/content";

function Card({ item }: { item: Certification }) {
  const credential = safeExternalUrl(item.credential_url);
  const image = fileUrl(item.certificate_image_path);
  const pdf = fileUrl(item.certificate_pdf_path);
  const logo = fileUrl(item.issuer_logo_path);
  const status = certificationStatus(item);

  return (
    <article className="flex flex-col border border-border bg-background">
      {image ? (
        <a href={image} target="_blank" rel="noopener noreferrer" className="block border-b border-border">
          <img
            src={image}
            alt={`${item.name} certificate`}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </a>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          {logo ? (
            <img
              src={logo}
              alt={`${item.issuer} logo`}
              loading="lazy"
              className="size-9 shrink-0 border border-border object-contain"
            />
          ) : null}
          <div className="min-w-0">
            <p className="label-eyebrow">{item.issuer}</p>
            <h3 className="mt-1 text-base leading-snug">{item.name}</h3>
          </div>
        </div>

        <p className="num mt-3 text-xs text-muted-foreground">
          {item.issue_date ? `Issued ${formatDate(item.issue_date)}` : "Issued —"}
          {` · ${status}`}
          {!item.does_not_expire && item.expiration_date
            ? ` ${formatDate(item.expiration_date)}`
            : ""}
        </p>

        {item.credential_id ? (
          <p className="num mt-1 text-xs text-muted-foreground">
            Credential ID {item.credential_id}
          </p>
        ) : null}

        {item.description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}

        {item.skills.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {item.skills.map((skill) => (
              <li key={skill} className="border border-border px-2 py-0.5 text-[0.6875rem]">
                {skill}
              </li>
            ))}
          </ul>
        ) : null}

        {credential || pdf ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-rule pt-4">
            {credential ? (
              <a
                href={credential}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="border border-input px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                Verify credential
              </a>
            ) : null}
            {pdf ? (
              <a
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-input px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                View certificate
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function CertificationsGrid() {
  const { data } = useQuery(certificationsQuery);
  const items = data ?? [];

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">To be added.</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
}
