export const config = { runtime: "nodejs" };

const MODEL = process.env.FITAI_OPENAI_MODEL || "gpt-5-mini";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function text(value, fallback = "") { return String(value ?? fallback).trim().slice(0, 300); }
function prefs(input = {}) {
  const budget = Number(input.budget);
  return {
    gender: text(input.gender, "Unspecified"), styles: Array.isArray(input.styles) ? input.styles.slice(0, 5).map(text) : [], colors: Array.isArray(input.colors) ? input.colors.slice(0, 6).map(text) : [], occasions: Array.isArray(input.occasions) ? input.occasions.slice(0, 5).map(text) : [], fit: text(input.fit, "Flexible"), quickStyle: text(input.quickStyle, "Streetwear"), quickOccasion: text(input.quickOccasion, "Casual"), budget: Number.isFinite(budget) && budget > 0 ? Math.min(budget, 100000) : 3000
  };
}
function outputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text.trim();
  return (payload?.output || []).flatMap(x => x?.content || []).map(x => x?.text || "").join("\n").trim();
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
      name: text(look.name, `FITAI Look ${i + 1}`), emoji: text(look.emoji, ["🖤", "🤍", "🕶️"][i]), match: Math.max(70, Math.min(99, Math.round(Number(look.match) || 90 - i * 4))), style: text(look.style || p.styles[0] || p.quickStyle), occasion: text(look.occasion || p.occasions[0] || p.quickOccasion), fit: text(look.fit || p.fit), total_price: Number.isFinite(price) ? Math.min(Math.max(300, Math.round(price)), p.budget) : p.budget, reason: text(look.reason, "Chosen to match your preferences, proportions, occasion and budget."), shirt: item(look.shirt), pant: item(look.pant), shoes: item(look.shoes), accessory: look.accessory ? item(look.accessory) : null
    };
  });
}
export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.OPENAI_API_KEY) return json({ configured: false, error: "OPENAI_API_KEY is missing in Vercel." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
  const p = prefs(body?.preferences);
  const photo = typeof body?.photoDataUrl === "string" && body.photoDataUrl.startsWith("data:image/") ? body.photoDataUrl.slice(0, 2500000) : "";
  const prompt = `You are FITAI, a Gen-Z personal stylist in India. Create exactly 3 COMPLETE, wearable outfits.\n\nUSER:\nGender: ${p.gender}\nStyles: ${p.styles.join(", ") || p.quickStyle}\nColors: ${p.colors.join(", ") || "flexible"}\nOccasion: ${p.occasions.join(", ") || p.quickOccasion}\nPreferred fit: ${p.fit}\nMaximum complete-outfit budget: INR ${p.budget}\n\nSTRICT OUTFIT RULES:\n- Each result is ONE PARTICULAR outfit, not a collection of options.\n- Exactly ONE shirt/top + exactly ONE pant/bottom + exactly ONE pair of shoes.\n- Optional: ONE accessory only.\n- Never give alternative shirts, pants, shoes or multiple choices.\n- Choose the single best combination for the user's visible broad proportions/silhouette, preferred fit, style, occasion, colors and budget.\n- If a photo is provided, use it only for broad clothing-fit/proportion context. Do not identify the person or infer sensitive traits.\n- Keep the total at or below INR ${p.budget}.\n- Make the 3 complete outfits different from each other.\n- Give concrete names/search queries suitable for Indian marketplaces.\n- Do not claim live availability or exact marketplace prices.\n- Return JSON only using exactly this structure: {"looks":[{"name":"...","emoji":"...","match":95,"style":"...","occasion":"...","fit":"...","total_price":2800,"reason":"...","shirt":{"name":"ONE shirt/top","price":900,"search_query":"..."},"pant":{"name":"ONE pant/bottom","price":1000,"search_query":"..."},"shoes":{"name":"ONE pair of shoes","price":900,"search_query":"..."},"accessory":{"name":"ONE optional accessory","price":200,"search_query":"..."}}]}`;
  const input = photo ? [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: photo }] }] : prompt;
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "content-type": "application/json", "authorization": `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: MODEL, input, reasoning: { effort: "low" }, max_output_tokens: 1200 }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return json({ configured: true, error: "The AI service could not generate the outfit right now." }, 502);
  const looks = normalize(parseJSON(outputText(payload)), p);
  if (looks.length !== 3) return json({ configured: true, error: "The AI returned an invalid outfit response. Please try again." }, 502);
  return json({ configured: true, looks });
}
