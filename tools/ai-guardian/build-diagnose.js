// tools/ai-guardian/build-diagnose.js
import { callOpenAI } from "./openai.js";
import { waitForDeployReady, fetchBuildLog } from "./netlify.js";

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

const deploy = await waitForDeployReady({ siteId, sha });

// Even if the workflow failed for reasons other than Netlify build error,
// we try to fetch details and provide something useful.
let deployDetails;
try {
  deployDetails = await fetchBuildLog({ deployId: deploy.id });
} catch (e) {
  deployDetails = { state: deploy?.state, error_message: String(e), id: deploy?.id };
}

const summary = {
  deploy_id: deploy?.id,
  state: deployDetails?.state ?? deploy?.state,
  error_message: deployDetails?.error_message ?? null,
  title: deployDetails?.title ?? null,
  created_at: deployDetails?.created_at ?? null,
  deploy_url: deployDetails?.deploy_ssl_url || deployDetails?.ssl_url || deployDetails?.url || null,
  commit_ref: deployDetails?.commit_ref ?? null,
  context: deployDetails?.context ?? null
};

const prompt = `
You are a senior build/release engineer. Diagnose a Netlify build/deploy failure and suggest actionable fixes.

Return:
1) Likely root cause(s) (bullets)
2) Fastest fix steps (numbered)
3) Preventative checks to add to CI (bullets)
4) If env var missing: specify which var and exactly where to set it (Netlify UI path / project settings)

Netlify deploy details (JSON):
${JSON.stringify(summary, null, 2)}
`;

const diagnosis = await callOpenAI({ input: prompt });

await octokit.rest.issues.createComment({
  owner,
  repo,
  issue_number: PR_NUMBER,
  body: `## 🧯 AI Deployment Guardian — Build Failure Diagnosis

${diagnosis}

_Deploy ID: ${deploy?.id ?? "unknown"} • State: ${deploy?.state ?? "unknown"}_`
});
