import Container from "./Container";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-10 dark:border-neutral-800">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </div>
        <div className="flex gap-4">
          {site.socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-700 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white"
            >
              {s.label}
            </a>
          ))}
        </div>
      </Container>
    </footer>
  );
}
