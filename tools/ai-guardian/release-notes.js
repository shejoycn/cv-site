// tools/ai-guardian/release-notes.js

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
const REPO = must("REPO");
const [owner, repo] = REPO.split("/");

const octokit = getOctokit(GITHUB_TOKEN);

// Find last tag; if none, use initial commit
let lastTag = "";
try {
  lastTag = execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
} catch {
  // no tags yet
}

const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
const log = execSync(`git log ${range} --pretty=format:"%h %s (%an)" --max-count=80`, {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

const prompt = `
Write release notes for a web app deployed to Netlify.

Rules:
- Start with a 1-sentence summary
- Then sections: Features, Fixes, Performance/SEO, Ops/DevEx
- Use bullet points, non-technical where possible
- Highlight any tracking/consent/CSP changes if present

Git log:
${log}
`;

const notes = await callOpenAI({ input: prompt });

// Create a draft release with a timestamp tag
const tag = `demo-${new Date().toISOString().slice(0, 10)}`;

await octokit.rest.repos.createRelease({
  owner,
  repo,
  tag_name: tag,
  name: `Release ${tag}`,
  body: notes,
  draft: true,
  prerelease: true,
});
