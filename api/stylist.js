export const config = {
  runtime: "nodejs",
};

const MODEL = process.env.FITAI_OPENAI_MODEL || "gpt-5-mini";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim().slice(0, 500);
}

function cleanPreferences(input = {}) {
  const budget = Number(input.budget);
  return {
    gender: cleanText(input.gender),
    styles: Array.isArray(input.styles) ? input.styles.slice(0, 5).map(v => cleanText(v)) : [],
    colors: Array.isArray(input.colors) ? input.colors.slice(0, 6).map(v => cleanText(v)) : [],
    occasions: Array.isArray(input.occasions) ? input.occasions.slice(0, 5).map(v => cleanText(v)) : [],
    fit: cleanText(input.fit),
    quickStyle: cleanText(input.quickStyle || "Streetwear"),
    quickOccasion: cleanText(input.quickOccasion || "Casual"),
    budget: Number.isFinite(budget) && budget > 0 ? Math.min(budget, 100000) : 3000
  };
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const chunks = [];
  for (const item of payload?.output || []) {
    for (const part of item?.content || []) {
      if (typeof part?.text === "string") chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}

function parseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const match = String(text || "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function normalizeLooks(data, preferences) {
  const looks = Array.isArray(data?.looks) ? data.looks : [];
  return looks.slice(0, 3).map((look, index) => {
    const price = Number(look.price);
    const safePrice = Number.isFinite(price)
      ? Math.max(300, Math.min(Math.round(price), preferences.budget))
      : Math.max(300, Math.round(preferences.budget * (0.55 + index * 0.12)));
    const items = Array.isArray(look.items)
      ? look.items.slice(0, 5).map(v => cleanText(v)).filter(Boolean)
      : cleanText(look.items).split(" · ").map(v => v.trim()).filter(Boolean).slice(0, 5);
    const reasons = Array.isArray(look.reasons)
      ? look.reasons.slice(0, 3).map(v => cleanText(v)).filter(Boolean)
      : [];
    return {
      name: cleanText(look.name, `FITAI Look ${index + 1}`).slice(0, 80),
      emoji: cleanText(look.emoji, ["🖤", "🤍", "🕶️"][index] || "✨").slice(0, 8),
      price: safePrice,
      tag: cleanText(look.tag || preferences.quickStyle).slice(0, 40),
      occasion: cleanText(look.occasion || preferences.quickOccasion).slice(0, 40),
      items: items.join(" · "),
      match: Math.max(70, Math.min(99, Number(look.match) || 88 - index * 4)),
      reasons: reasons.length ? reasons : ["matched to your preferences", "fits the selected occasion", "kept within your budget"],
      overBudget: false
    };
  });
}

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.OPENAI_API_KEY) {
    return json({ configured: false, error: "AI is not configured yet. Add OPENAI_API_KEY to the Vercel project environment variables." }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const preferences = cleanPreferences(body?.preferences);
  const extraInstruction = cleanText(body?.extraInstruction);
  const photoDataUrl = typeof body?.photoDataUrl === "string" && body.photoDataUrl.startsWith("data:image/")
    ? body.photoDataUrl.slice(0, 2_500_000)
    : "";

  const prompt = `You are FITAI, a practical Gen-Z personal stylist in India.
Create exactly 3 wearable outfit looks for the user.

USER PREFERENCES:
Gender: ${preferences.gender || "Unspecified"}
Styles: ${preferences.styles.join(", ") || preferences.quickStyle}
Colors: ${preferences.colors.join(", ") || "No strict color preference"}
Occasions: ${preferences.occasions.join(", ") || preferences.quickOccasion}
Fit: ${preferences.fit || "Flexible"}
Budget per outfit: INR ${preferences.budget}

${extraInstruction ? `ADDITIONAL REQUEST: ${extraInstruction}\n` : ""}
RULES:
- Every outfit must stay at or below the budget.
- Use realistic clothing combinations available in India.
- Give concrete item names useful as marketplace search queries.
- Keep each outfit coherent and meaningfully different.
- Do not claim exact live product availability or exact prices.
- Use the uploaded photo only for broad styling context such as silhouette, layering and proportions; do not identify the person.
- Return JSON only in this exact shape: {"looks":[{"name":"...","emoji":"...","price":2500,"tag":"...","occasion":"...","items":["item 1","item 2","item 3"],"match":92,"reasons":["...","...","..."]}]} `;

  const input = photoDataUrl ? [{
    role: "user",
    content: [
      { type: "input_text", text: prompt },
      { type: "input_image", image_url: photoDataUrl }
    ]
  }] : prompt;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      input,
      max_output_tokens: 1200
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("FITAI OpenAI error", response.status, payload);
    return json({ configured: true, error: "The AI service could not generate a look right now." }, 502);
  }

  const parsed = parseJSON(extractOutputText(payload));
  const looks = normalizeLooks(parsed, preferences);
  if (looks.length !== 3) {
    console.error("FITAI invalid AI output", extractOutputText(payload));
    return json({ configured: true, error: "The AI returned an invalid styling response." }, 502);
  }

  return json({ configured: true, model: MODEL, looks });
}
