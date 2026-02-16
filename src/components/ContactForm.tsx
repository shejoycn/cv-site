"use client";

import { useMemo, useState } from "react";
import { site } from "@/lib/site";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export default function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  const disabled = useMemo(() => state.status === "loading", [state.status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "loading" });

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      (e.target as HTMLFormElement).reset();
      setState({ status: "success" });
    } catch (err: any) {
      setState({ status: "error", message: err?.message ?? "Failed to submit." });
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4">
        <div className="text-lg font-semibold">Send a message</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          Prefer email?{" "}
          <a className="underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-600"
            placeholder="Jane Doe"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-600"
            placeholder="jane@company.com"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-600"
            placeholder="Tell me what you’re building, and how I can help."
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="h-11 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {state.status === "loading" ? "Sending..." : "Send"}
        </button>

        {state.status === "success" ? (
          <p className="text-sm text-green-700 dark:text-green-400">Message sent. I’ll get back to you.</p>
        ) : null}
        {state.status === "error" ? (
          <p className="text-sm text-red-700 dark:text-red-400">{state.message}</p>
        ) : null}
      </form>
    </div>
  );
}
