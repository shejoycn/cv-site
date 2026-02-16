"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Container from "./Container";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type NavItem = { label: string; href: string };

export default function Nav() {
  const items: NavItem[] = useMemo(
    () => [
      { label: "About", href: "#about" },
      { label: "Experience", href: "#experience" },
      { label: "Projects", href: "#projects" },
      { label: "Skills", href: "#skills" },
      { label: "Education", href: "#education" },
      { label: "Contact", href: "#contact" },
    ],
    []
  );

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/60",
        scrolled ? "border-neutral-200 dark:border-neutral-800" : "border-transparent"
      )}
    >
      <Container className="py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white grid place-items-center text-sm font-semibold dark:bg-white dark:text-neutral-900">
              {site.name
                .split(" ")
                .slice(0, 2)
                .map((s) => s[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{site.name}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300">{site.title}</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                className="text-sm text-neutral-700 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white"
              >
                {it.label}
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Let’s talk
            </a>
          </div>

          <button
            className="md:hidden rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <div
          id="mobile-nav"
          className={cn(
            "md:hidden overflow-hidden transition-[max-height,opacity] duration-300",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="pt-3 flex flex-col gap-2">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                className="rounded-xl px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                onClick={() => setOpen(false)}
              >
                {it.label}
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              onClick={() => setOpen(false)}
            >
              Let’s talk
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
