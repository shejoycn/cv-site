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

/**
 * Build a map of valid RIGHT-side (HEAD) line numbers per file from a unified diff.
 * We use this to ensure inline comments only target lines that exist in the diff on the RIGHT side.
 */
function buildRightSideLineMapFromUnifiedDiff(unified) {
  const map = new Map(); // path -> Set(lines)
  const lines = unified.split("\n");

  let currentPath = null;
  let rightLine = null;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    // file headers: "diff --git a/... b/..."
    if (l.startsWith("diff --git ")) {
      currentPath = null;
      rightLine = null;
      continue;
    }

    // Prefer "+++ b/..." as the target path
    if (l.startsWith("+++ ")) {
      const p = l.slice(4).trim();
      // ignore /dev/null (deleted file)
      if (p === "/dev/null") {
        currentPath = null;
        continue;
      }
      currentPath = p.startsWith("b/") ? p.slice(2) : p;
      if (!map.has(currentPath)) map.set(currentPath, new Set());
      continue;
    }

    // hunk header: @@ -oldStart,oldCount +newStart,newCount @@
    if (l.startsWith("@@ ")) {
      // Example: @@ -12,7 +12,9 @@
      const m = l.match(/\+\s*([0-9]+)(?:,([0-9]+))?/); // +newStart,newCount
      if (!m) {
        rightLine = null;
        continue;
      }
      rightLine = Number(m[1]);
      continue;
    }

    if (!currentPath || rightLine == null) continue;

    // Within hunk:
    // ' ' context line => advances both
    // '+' added line => advances right only (and is commentable)
    // '-' removed line => advances left only (right does NOT advance)
    // '\ No newline...' => ignore
    if (l.startsWith("\\ No newline")) continue;

    if (l.startsWith(" ")) {
      // context line exists on right
      map.get(currentPath).add(rightLine);
      rightLine += 1;
      continue;
    }

    if (l.startsWith("+")) {
      // added line exists on right
      map.get(currentPath).add(rightLine);
      rightLine += 1;
      continue;
    }

    if (l.startsWith("-")) {
      // removed line: rightLine unchanged
      continue;
    }
  }

  return map;
}

const rightSideLinesByFile = buildRightSideLineMapFromUnifiedDiff(diff);

/**
 * Ask AI for:
 * 1) a summary markdown review body
 * 2) inline comments as JSON array: [{ path, line, body, severity? }]
 *
 * IMPORTANT: "line" must be RIGHT-side (HEAD) line number in that file.
 */
const prompt = `
You are an expert release engineer reviewing a PR before Netlify deployment.

Output MUST be valid JSON (no backticks, no trailing commas) with this shape:

{
  "summary_markdown": "## ...",
  "inline_comments": [
    {
      "path": "relative/path/from/repo/root.ext",
      "line": 123,
      "body": "Comment in Markdown. Be specific and actionable.",
      "severity": "blocker|high|medium|low"
    }
  ]
}

Rules for inline_comments:
- Only comment on the RIGHT side (HEAD) of the diff.
- Use file paths exactly as in the diff (repo-relative).
- Use real, concrete suggestions with file/line context.
- Prefer <= 10 inline comments; prioritize blockers/high first.

Also include in summary_markdown:
1) Risk rating (Low/Medium/High)
2) Top issues (bulleted)
3) Deployment blockers (must-fix)
4) Recommended test checklist
5) Security checks: secrets exposure, env var misuse, CSP/analytics risks

PR diff:
${diff}
`.trim();

const raw = await callOpenAI({ input: prompt, debugLabel: "pr-review" });

let ai;
try {
  ai = JSON.parse(raw);
} catch (e) {
  ai = null;
}

const fallbackSummary =
  raw && raw.trim()
    ? `## 🤖 AI Deployment Guardian — PR Review\n\n${raw.trim()}`
    : "⚠️ AI returned an empty response. Check GitHub Actions logs for the raw OpenAI response.";

const summaryMarkdown =
  ai?.summary_markdown && typeof ai.summary_markdown === "string" && ai.summary_markdown.trim()
    ? ai.summary_markdown.trim()
    : fallbackSummary;

// Validate/filter inline comments against the diff-derived right-side line map
function filterInlineComments(inlineComments) {
  if (!Array.isArray(inlineComments)) return [];

  const out = [];
  for (const c of inlineComments) {
    if (!c || typeof c !== "object") continue;

    const path = String(c.path || "").trim();
    const line = Number(c.line);
    const body = String(c.body || "").trim();

    if (!path || !Number.isFinite(line) || line <= 0 || !body) continue;

    const validLines = rightSideLinesByFile.get(path);
    if (!validLines) continue;
    if (!validLines.has(line)) continue; // must be a line present on RIGHT side of diff

    out.push({
      path,
      line,
      side: "RIGHT",
      body,
    });
  }

  // Cap to 10 to avoid spam / API limits
  return out.slice(0, 10);
}

const inlineComments = filterInlineComments(ai?.inline_comments);

// Create a PR review with inline comments (if any)
try {
  if (inlineComments.length > 0) {
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: PR_NUMBER,
      event: "COMMENT",
      body: `${summaryMarkdown}

---

<details><summary>Debug</summary>

- base: \`${BASE_SHA}\`
- head: \`${HEAD_SHA}\`
- diff chars: \`${diff.length}\`
- inline comments: \`${inlineComments.length}\`

</details>

_This is an automated review._`,
      comments: inlineComments,
    });
  } else {
    // Fallback: if we couldn't confidently place inline comments, post a single top-level comment
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: PR_NUMBER,
      body: `${summaryMarkdown}

---

<details><summary>Debug</summary>

- base: \`${BASE_SHA}\`
- head: \`${HEAD_SHA}\`
- diff chars: \`${diff.length}\`
- inline comments: \`0\` (none placed)

</details>

_This is an automated review._`,
    });
  }
} catch (err) {
  // If review creation fails (permissions / API constraints), fallback to top-level comment
  const msg = err?.message ? String(err.message) : String(err);
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: PR_NUMBER,
    body: `${summaryMarkdown}

---

⚠️ Failed to create inline PR review comments via GitHub API.
Error: \`${msg}\`

<details><summary>Debug</summary>

- base: \`${BASE_SHA}\`
- head: \`${HEAD_SHA}\`
- diff chars: \`${diff.length}\`

</details>

_This is an automated review._`,
  });
}
