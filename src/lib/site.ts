export type Social = { label: string; href: string };
export type Experience = {
  company: string;
  role: string;
  location?: string;
  start: string;
  end: string;
  highlights: string[];
  stack?: string[];
};
export type Project = {
  name: string;
  description: string;
  href?: string;
  repo?: string;
  tags: string[];
};
export type Education = {
  school: string;
  degree: string;
  start: string;
  end: string;
  notes?: string[];
};

export const site = {
  name: "Your Name",
  title: "Senior Product / Engineering Leader",
  location: "Dubai, UAE",
  email: "you@example.com",
  summary:
    "I build and scale digital products: modern web platforms, mobile experiences, and API-first ecosystems. I lead cross-functional teams, ship fast, and care about performance, security, and measurable outcomes.",
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com/in/your-handle" },
    { label: "GitHub", href: "https://github.com/your-handle" },
    { label: "X", href: "https://x.com/your-handle" },
  ] satisfies Social[],

  about: [
    "I’m a technologist focused on building delightful digital experiences and platforms that scale.",
    "I’ve led multi-disciplinary teams (design, FE/BE, QA, DevOps) across discovery, delivery, and optimization.",
    "I care about clean architecture, observability, and pragmatic engineering.",
  ],

  skills: {
    Core: ["Product Delivery", "Architecture", "Stakeholder Management", "Roadmapping", "Agile / Scrum"],
    Engineering: ["Next.js", "React", "Node.js", "TypeScript", "REST/GraphQL", "CI/CD"],
    Platforms: ["Sitecore", "Contentstack", "Headless CMS", "Akamai / CDN", "Datadog RUM"],
    "Cloud & DevOps": ["Azure", "Netlify/Vercel", "Terraform", "Docker", "Monitoring/Logging"],
  } as Record<string, string[]>,

  experience: [
    {
      company: "Company Name",
      role: "Role Title",
      location: "Dubai, UAE",
      start: "2022",
      end: "Present",
      highlights: [
        "Led rebuild of a multi-brand platform with a headless architecture, improving page performance and content velocity.",
        "Defined target-state architecture and delivery roadmap across web, mobile, and integrations.",
        "Established analytics/observability standards and security headers (CSP, consent) across properties.",
      ],
      stack: ["Next.js", "TypeScript", "Headless CMS", "Akamai", "Azure"],
    },
    {
      company: "Previous Company",
      role: "Senior Engineer / Lead",
      location: "Remote",
      start: "2018",
      end: "2022",
      highlights: [
        "Built reusable UI component libraries and design systems to accelerate delivery across teams.",
        "Owned CI/CD pipelines, release automation, and incident response playbooks.",
      ],
      stack: ["React", "Node.js", "CI/CD", "Cloud"],
    },
  ] satisfies Experience[],

  projects: [
    {
      name: "Project One",
      description: "A modern CV website template with excellent Lighthouse scores and strong SEO defaults.",
      href: "https://example.com",
      repo: "https://github.com/your-handle/project-one",
      tags: ["Next.js", "Tailwind", "SEO"],
    },
    {
      name: "Project Two",
      description: "An internal accelerator to convert designs into components and wire content from a CMS.",
      tags: ["Design Systems", "Automation", "Headless CMS"],
    },
  ] satisfies Project[],

  education: [
    {
      school: "University Name",
      degree: "B.Tech / BSc in Computer Science",
      start: "2000",
      end: "2004",
      notes: ["Activities, awards, specialization (optional)."],
    },
  ] satisfies Education[],
};
