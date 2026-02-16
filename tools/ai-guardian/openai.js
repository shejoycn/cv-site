// tools/ai-guardian/openai.js
import fetch from "node-fetch";

function extractTextFromResponsesAPI(json) {
  // 1) Convenience field (often present)
  if (typeof json?.output_text === "string" && json.output_text.trim()) {
    return json.output_text;
  }

  // 2) Robust extraction from output[] messages
  const out = json?.output;
  if (Array.isArray(out)) {
    const chunks = [];
    for (const item of out) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (c?.type === "output_text" && typeof c?.text === "string") chunks.push(c.text);
          if (c?.type === "text" && typeof c?.text === "string") chunks.push(c.text);
        }
      }
    }
    const merged = chunks.join("\n").trim();
    if (merged) return merged;
  }

  return "";
}

export async function callOpenAI({
  input,
  model = "gpt-4.1-mini",
  debugLabel = "openai-call",
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input,
    }),
  });

  const rawText = await res.text();

  if (!res.ok) {
    // Print raw body so you see exactly why it failed in Actions logs
    console.error(`[${debugLabel}] OpenAI HTTP ${res.status}: ${rawText}`);
    throw new Error(`OpenAI error ${res.status}: ${rawText}`);
  }

  let json;
  try {
    json = JSON.parse(rawText);
  } catch (e) {
    console.error(`[${debugLabel}] Could not parse JSON. Raw:`);
    console.error(rawText);
    throw e;
  }

  const extracted = extractTextFromResponsesAPI(json);

  // Always print what we got (shows in GitHub Actions logs)
  console.log(`\n[${debugLabel}] Extracted AI text:\n${extracted || "(empty)"}\n`);

  // Also print a truncated raw response to debug formatting issues
  const trunc = rawText.length > 2500 ? rawText.slice(0, 2500) + "\n...TRUNCATED..." : rawText;
  console.log(`[${debugLabel}] Raw response (truncated):\n${trunc}\n`);

  return extracted;
}
