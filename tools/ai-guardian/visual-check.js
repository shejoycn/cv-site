// tools/ai-guardian/visual-check.js
import { chromium } from "playwright";
import { callOpenAI } from "./openai.js";
import { waitForDeployReady } from "./netlify.js";
import fs from "node:fs";

import github from "@actions/github";
const { getOctokit } = github;

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

const siteId = must("NETLIFY_SITE_ID");
const sha = must("HEAD_SHA");
const GITHUB_TOKEN = must("GITHUB_TOKEN");
const PR_NUMBER = Number(must("PR_NUMBER"));
const REPO = must("REPO");
const [owner, repo] = REPO.split("/");

const octokit = getOctokit(GITHUB_TOKEN);

// 1) Wait for Netlify Deploy Preview for this commit
const deploy = await waitForDeployReady({ siteId, sha });
const previewUrl = deploy?.deploy_ssl_url || deploy?.ssl_url || deploy?.url;

if (!previewUrl) throw new Error("Could not determine Netlify preview URL");

// If Netlify says the deploy errored, fail so the workflow can run build-diagnose.js
if (deploy.state === "error") {
  throw new Error(`Netlify deploy is in error state. deployId=${deploy.id}`);
}

// 2) Take screenshots (keep it tiny for demo)
const pagesToCheck = ["/"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const shots = [];
for (const p of pagesToCheck) {
  const url = `${previewUrl}${p}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });

  const file = `shot-${p.replace(/\W+/g, "_")}.png`;
  await page.screenshot({ path: file, fullPage: true });
  shots.push({ path: file, url });
}

await browser.close();

// 3) AI visual QA (semantic check)
const images = shots.map((s) => ({
  type: "input_image",
  image_url: `data:image/png;base64,${fs.readFileSync(s.path).toString("base64")}`,
}));

const prompt = [
  {
    role: "user",
    content: [
      {
        type: "input_text",
        text: `You are a QA engineer doing semantic visual regression checks on a Netlify Deploy Preview.

Check for:
- obvious broken layout, missing sections, overlapping text
- broken nav/header/footer
- missing images/icons
- cookie/consent banner covering content
- mobile/responsive concerns (infer from layout)
- suspicious placeholders (Lorem ipsum, “undefined”, empty cards)

Output:
1) Overall PASS/FAIL
2) Issues grouped by severity (Blocker/Major/Minor)
3) Which page URL each issue appears on
4) Suggested fix direction (frontend/CMS/config)

Pages in order: ${shots.map((s) => s.url).join(", ")}
`,
      },
      ...images,
    ],
  },
];

const visualReport = await callOpenAI({ input: prompt, debugLabel: "visual-check" });
const safeText =
  visualReport && visualReport.trim()
    ? visualReport
    : "⚠️ AI returned an empty response. Check GitHub Actions logs for the raw OpenAI response.";

await octokit.rest.issues.createComment({
  owner,
  repo,
  issue_number: PR_NUMBER,
  body: `## 👀 AI Deployment Guardian — Visual Check (Netlify Preview)

**Preview:** ${previewUrl}

${safeText}

_This is an automated visual QA check._`,
});
