export const config = { runtime: "nodejs" };

const MODEL = process.env.FITAI_OPENAI_MODEL || "gpt-5-mini";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function text(value, fallback = "") { return String(value ?? fallback).trim().slice(0, 300); }
function prefs(input = {}) {
  const budget = Number(input.budget);
  return {
    gender: text(input.gender, "Unspecified"),
    styles: Array.isArray(input.styles) ? input.styles.slice(0, 5).map(text) : [],
    colors: Array.isArray(input.colors) ? input.colors.slice(0, 6).map(text) : [],
    occasions: Array.isArray(input.occasions) ? input.occasions.slice(0, 5).map(text) : [],
    fit: text(input.fit, "Flexible"),
    quickStyle: text(input.quickStyle, "Streetwear"),
    quickOccasion: text(input.quickOccasion, "Casual"),
    budget: Number.isFinite(budget) && budget > 0 ? Math.min(budget, 100000) : 3000
  };
}
function outputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  return (payload?.output || []).flatMap(x => x?.content || []).map(x => x?.text || x?.value || "").join("\n").trim();
}
function parseJSON(raw) {
  try { return JSON.parse(raw); } catch {}
  const match = String(raw || "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}
function normalize(data, p) {
  const looks = Array.isArray(data?.looks) ? data.looks.slice(0, 3) : [];
  return looks.map((look, i) => {
    const item = value => ({ name: text(value?.name || value), price: Math.max(0, Math.round(Number(value?.price) || 0)), search_query: text(value?.search_query || value?.name || value) });
    const price = Number(look.total_price);
    return {
      name: text(look.name, `FITAI Look ${i + 1}`), emoji: text(look.emoji, ["🖤", "🤍", "🕶️"][i]),
      match: Math.max(70, Math.min(99, Math.round(Number(look.match) || (90 - i * 4)))), style: text(look.style || p.styles[0] || p.quickStyle), occasion: text(look.occasion || p.occasions[0] || p.quickOccasion), fit: text(look.fit || p.fit),
      total_price: Number.isFinite(price) ? Math.min(Math.max(300, Math.round(price)), p.budget) : p.budget,
      reason: text(look.reason, "Chosen to match your preferences, proportions, occasion and budget."),
      shirt: item(look.shirt), pant: item(look.pant), shoes: item(look.shoes), accessory: look.accessory ? item(look.accessory) : null
    };
  });
}

const itemSchema = { type: "object", additionalProperties: false, properties: { name: { type: "string" }, price: { type: "number" }, search_query: { type: "string" } }, required: ["name", "price", "search_query"] };
const outfitSchema = {
  type: "object", additionalProperties: false,
  properties: { looks: { type: "array", minItems: 3, maxItems: 3, items: {
    type: "object", additionalProperties: false,
    properties: {
      name: { type: "string" }, emoji: { type: "string" }, match: { type: "number" }, style: { type: "string" }, occasion: { type: "string" }, fit: { type: "string" }, total_price: { type: "number" }, reason: { type: "string" },
      shirt: itemSchema, pant: itemSchema, shoes: itemSchema,
      accessory: { anyOf: [itemSchema, { type: "null" }] }
    },
    required: ["name", "emoji", "match", "style", "occasion", "fit", "total_price", "reason", "shirt", "pant", "shoes", "accessory"]
  } } },
  required: ["looks"]
};

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY is missing in Vercel Environment Variables." }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }
  const p = prefs(body?.preferences);
  const photo = typeof body?.photoDataUrl === "string" && body.photoDataUrl.startsWith("data:image/") ? body.photoDataUrl : "";

  const prompt = `You are FITAI, a Gen-Z personal stylist in India. Create exactly 3 complete, wearable outfits.
USER: Gender ${p.gender}; styles ${p.styles.join(", ") || p.quickStyle}; colors ${p.colors.join(", ") || "flexible"}; occasion ${p.occasions.join(", ") || p.quickOccasion}; fit ${p.fit}; maximum budget INR ${p.budget}.
RULES: Each result is ONE particular outfit, not options. Exactly one shirt/top, one pant/bottom and one pair of shoes. Optional one accessory. Never provide alternatives. Keep every outfit at or below the budget. Make all 3 different. Use concrete item names and useful Indian marketplace search queries. If a photo is provided, use only broad clothing-fit/proportion context; do not identify the person or infer sensitive traits. Do not claim live availability or exact marketplace prices. Return only the requested JSON.`;
  const input = photo ? [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: photo }] }] : prompt;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: MODEL, input, reasoning: { effort: "low" }, max_output_tokens: 1800, text: { format: { type: "json_schema", name: "fitai_outfits", strict: true, schema: outfitSchema } } })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { console.error("FITAI OpenAI error:", response.status, payload); return json({ error: `AI service error (${response.status}). Check Vercel deployment logs.` }, 502); }
    const parsed = parseJSON(outputText(payload));
    const looks = normalize(parsed, p);
    if (looks.length !== 3 || looks.some(x => !x.shirt?.name || !x.pant?.name || !x.shoes?.name)) return json({ error: "AI returned an incomplete outfit. Please try again." }, 502);
    return json({ configured: true, looks });
  } catch (error) {
    console.error("FITAI server error:", error);
    return json({ error: "FITAI could not reach the AI service. Check your Vercel deployment and OPENAI_API_KEY." }, 502);
  }
}
