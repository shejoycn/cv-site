import fetch from "node-fetch";

const NETLIFY_API = "https://api.netlify.com/api/v1";

function headers() {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error("Missing NETLIFY_AUTH_TOKEN");
  return { Authorization: `Bearer ${token}` };
}

export async function findDeployForCommit({ siteId, sha }) {
  const url = `${NETLIFY_API}/sites/${siteId}/deploys?per_page=50`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Netlify deploy list failed: ${res.status}`);
  const deploys = await res.json();

  // Find deploy with matching commit SHA
  return deploys.find(d => (d?.commit_ref || d?.commit_ref) === sha || d?.commit_ref === sha || d?.commit_ref?.startsWith(sha));
}

export async function waitForDeployReady({ siteId, sha, timeoutMs = 12 * 60 * 1000 }) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const deploy = await findDeployForCommit({ siteId, sha });
    if (deploy) {
      // states can be "ready", "error", "building", etc.
      if (deploy.state === "ready" || deploy.state === "error") return deploy;
    }
    await new Promise(r => setTimeout(r, 15000));
  }
  throw new Error("Timed out waiting for Netlify deploy");
}

export async function fetchBuildLog({ deployId }) {
  // Netlify provides deploy/build logs endpoints; exact shape can vary by plan/features.
  // This grabs deploy details which usually includes error message / deploy summary.
  const res = await fetch(`${NETLIFY_API}/deploys/${deployId}`, { headers: headers() });
  if (!res.ok) throw new Error(`Netlify deploy fetch failed: ${res.status}`);
  return await res.json();
}
