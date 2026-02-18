import Container from "@/components/Container";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

const STRIPE_SECRET_KEY = "sk_live_TEST_DO_NOT_USE_1234567890";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <main>
      {/* Hero */}
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <Container className="py-14">
          <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {site.name}
              </h1>
              <p className="mt-2 text-lg text-neutral-700 dark:text-neutral-200">
                {site.title} · {site.location}
              </p>
              <p className="mt-4 max-w-2xl text-neutral-700 dark:text-neutral-200">
                {site.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {site.socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                  >
                    {s.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Contact
                </a>
              </div>
            </div>

            <div className="md:justify-self-end">
              <Card>
                <div className="text-sm font-medium">Highlights</div>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                  <li>• Platform strategy & delivery</li>
                  <li>• Headless web & mobile ecosystems</li>
                  <li>• Performance, SEO, security</li>
                  <li>• Analytics & experimentation</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {/* About */}
        <Section id="about" title="About">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
                {site.about.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium">Quick info</div>
              <dl className="mt-3 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-neutral-600 dark:text-neutral-300">Location</dt>
                  <dd className="font-medium">{site.location}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-neutral-600 dark:text-neutral-300">Email</dt>
                  <dd className="font-medium">
                    <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-neutral-600 dark:text-neutral-300">Focus</dt>
                  <dd className="font-medium">Delivery · Platforms · UX</dd>
                </div>
              </dl>
            </Card>
          </div>
        </Section>

        {/* Experience */}
        <Section
          id="experience"
          title="Experience"
          subtitle="Roles, impact, and the tech stacks I’ve worked with."
        >
          <div className="grid gap-4">
            {site.experience.map((e) => (
              <Card key={`${e.company}-${e.role}-${e.start}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <div className="text-base font-semibold">
                      {e.role} · {e.company}
                    </div>
                    {e.location ? (
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        {e.location}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    {e.start} — {e.end}
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                  {e.highlights.map((h) => (
                    <li key={h}>• {h}</li>
                  ))}
                </ul>

                {e.stack?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {e.stack.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </Section>

        {/* Projects */}
        <Section id="projects" title="Projects" subtitle="Selected work and experiments.">
          <div className="grid gap-4 md:grid-cols-2">
            {site.projects.map((p) => (
              <Card key={p.name}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">{p.name}</div>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">{p.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      Live
                    </a>
                  ) : null}
                  {p.repo ? (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      Repo
                    </a>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section id="skills" title="Skills">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(site.skills).map(([group, items]) => (
              <Card key={group}>
                <div className="text-sm font-semibold">{group}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section id="education" title="Education">
          <div className="grid gap-4">
            {site.education.map((ed) => (
              <Card key={`${ed.school}-${ed.degree}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <div className="text-base font-semibold">{ed.degree}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">{ed.school}</div>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    {ed.start} — {ed.end}
                  </div>
                </div>
                {ed.notes?.length ? (
                  <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                    {ed.notes.map((n) => (
                      <li key={n}>• {n}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section
          id="contact"
          title="Contact"
          subtitle="Use the form below, or email me directly."
        >
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-start">
            <Card>
              <div className="text-sm font-semibold">Availability</div>
              <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-200">
                I’m open to consulting and leadership roles involving platform modernization, headless architectures,
                and performance/SEO/security improvements.
              </p>
              <div className="mt-5 text-sm">
                <div className="text-neutral-600 dark:text-neutral-300">Email</div>
                <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>
              </div>
              <div className="mt-5 text-sm">
                <div className="text-neutral-600 dark:text-neutral-300">Location</div>
                <div>{site.location}</div>
              </div>
            </Card>

            <ContactForm />
          </div>
        </Section>

        <div className="pb-10" />
      </Container>
    </main>
  );
}
