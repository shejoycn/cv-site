// tools/ai-guardian/pr-review.js
import { callOpenAI } from "./openai.js";
import { execSync } from "node:child_process";

import github from "@actions/github";
const { getOctokit } = github;

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

const GITHUB_TOKEN = must("GITHUB_TOKEN");
const PR_NUMBER = Number(must("PR_NUMBER"));
const REPO = must("REPO");
const BASE_SHA = must("BASE_SHA");
const HEAD_SHA = must("HEAD_SHA");

const [owner, repo] = REPO.split("/");
const octokit = getOctokit(GITHUB_TOKEN);

// Diff for review
const diff = execSync(`git diff --unified=3 ${BASE_SHA}...${HEAD_SHA}`, {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

const prompt = `
You are an expert release engineer reviewing a PR before Netlify deployment.

Return:
1) Risk rating (Low/Medium/High)
2) Top 5 issues (if any) with concrete file/line hints when possible
3) Deployment blockers (must-fix)
4) Recommended test checklist
5) Security checks: secrets exposure, env var misuse, CSP/analytics risks

PR diff:
${diff}
`;

const analysis = await callOpenAI({ input: prompt, debugLabel: "pr-review" });
const safeText =
  analysis && analysis.trim()
    ? analysis
    : "⚠️ AI returned an empty response. Check GitHub Actions logs for the raw OpenAI response.";

await octokit.rest.issues.createComment({
  owner,
  repo,
  issue_number: PR_NUMBER,
  body: `## 🤖 AI Deployment Guardian — PR Review

${safeText}

---

<details><summary>Debug</summary>

- base: \`${BASE_SHA}\`
- head: \`${HEAD_SHA}\`
- diff chars: \`${diff.length}\`

</details>

_This is an automated review._`,
});
