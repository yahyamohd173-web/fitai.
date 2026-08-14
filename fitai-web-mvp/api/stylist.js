export const config = { runtime: "nodejs" };

const MODEL = process.env.FITAI_OPENAI_MODEL || "gpt-4.1-mini";
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const text = (v, d = "") => String(v ?? d).trim().slice(0, 240);

function prefs(x = {}) {
  const budget = Number(x.budget);
  return {
    style: text(x.quickStyle, Array.isArray(x.styles) && x.styles[0] || "Streetwear"),
    occasion: text(x.quickOccasion, Array.isArray(x.occasions) && x.occasions[0] || "Casual"),
    fit: text(x.fit, "Relaxed"),
    colors: Array.isArray(x.colors) ? x.colors.slice(0, 3).map(v => text(v)) : [],
    budget: Number.isFinite(budget) && budget > 0 ? budget : 3000
  };
}

function fallback(p) {
  const c = p.colors[0] || "Black";
  const looks = [
    { name: `${p.style} Essential`, emoji: "🖤", shirt: [`${c} relaxed-fit cotton shirt`, 850], pant: ["Straight-fit black trousers", 1050], shoes: ["Minimal white sneakers", 900] },
    { name: `${p.style} Clean Fit`, emoji: "🤍", shirt: ["Cream oversized textured shirt", 950], pant: ["Dark straight-fit jeans", 1100], shoes: ["Black low-top sneakers", 850] },
    { name: `${p.style} Statement Fit`, emoji: "🕶️", shirt: ["Oversized graphic tee", 700], pant: ["Wide-leg cargo pants", 1150], shoes: ["Retro chunky sneakers", 1050] }
  ];
  return looks.map((x, i) => {
    const items = [x.shirt, x.pant, x.shoes];
    return {
      name: x.name, emoji: x.emoji, match: 94 - i * 3, style: p.style, occasion: p.occasion, fit: p.fit,
      total_price: Math.min(items.reduce((s, a) => s + a[1], 0), p.budget),
      reason: `A complete ${p.style} outfit for ${p.occasion.toLowerCase()} with a ${p.fit.toLowerCase()} fit.`,
      shirt: { name: x.shirt[0], price: x.shirt[1], search_query: `${x.shirt[0]} men India` },
      pant: { name: x.pant[0], price: x.pant[1], search_query: `${x.pant[0]} men India` },
      shoes: { name: x.shoes[0], price: x.shoes[1], search_query: `${x.shoes[0]} men India` },
      accessory: null
    };
  });
}

function parseJSON(raw) {
  try { return JSON.parse(raw); } catch {}
  const match = String(raw || "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function outputText(data) {
  if (typeof data?.output_text === "string") return data.output_text.trim();
  return (data?.output || []).flatMap(x => x?.content || []).map(x => x?.text || x?.value || "").join("\n").trim();
}

function normalize(data, p) {
  if (!Array.isArray(data?.looks) || data.looks.length !== 3) return null;
  return data.looks.map((look, i) => ({
    name: text(look.name, `FITAI Look ${i + 1}`), emoji: text(look.emoji, ["🖤", "🤍", "🕶️"][i]),
    match: Math.max(70, Math.min(99, Number(look.match) || 90)), style: text(look.style, p.style), occasion: text(look.occasion, p.occasion), fit: text(look.fit, p.fit),
    total_price: Math.min(Math.max(300, Number(look.total_price) || p.budget), p.budget), reason: text(look.reason, "Matched to your preferences and budget."),
    shirt: item(look.shirt), pant: item(look.pant), shoes: item(look.shoes), accessory: look.accessory ? item(look.accessory) : null
  }));
}
function item(v) {
  if (!v) return { name: "", price: 0, search_query: "" };
  const name = text(v.name || v);
  return { name, price: Math.max(0, Number(v.price) || 0), search_query: text(v.search_query, name) };
}

const schema = {
  type: "object", additionalProperties: false, required: ["looks"],
  properties: { looks: { type: "array", minItems: 3, maxItems: 3, items: {
    type: "object", additionalProperties: false,
    required: ["name","emoji","match","style","occasion","fit","total_price","reason","shirt","pant","shoes","accessory"],
    properties: {
      name:{type:"string"}, emoji:{type:"string"}, match:{type:"number"}, style:{type:"string"}, occasion:{type:"string"}, fit:{type:"string"}, total_price:{type:"number"}, reason:{type:"string"},
      shirt:{type:"object",additionalProperties:false,required:["name","price","search_query"],properties:{name:{type:"string"},price:{type:"number"},search_query:{type:"string"}}},
      pant:{type:"object",additionalProperties:false,required:["name","price","search_query"],properties:{name:{type:"string"},price:{type:"number"},search_query:{type:"string"}}},
      shoes:{type:"object",additionalProperties:false,required:["name","price","search_query"],properties:{name:{type:"string"},price:{type:"number"},search_query:{type:"string"}}},
      accessory:{anyOf:[{type:"object",additionalProperties:false,required:["name","price","search_query"],properties:{name:{type:"string"},price:{type:"number"},search_query:{type:"string"}}},{type:"null"}]}
    }
  }}
};

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body = {};
  try { body = await request.json(); } catch { return json({ error: "Invalid request body" }, 400); }
  const p = prefs(body.preferences);

  // Always keep the app usable even if the OpenAI key is missing or the AI service is slow.
  const instantFallback = fallback(p);
  if (!process.env.OPENAI_API_KEY) return json({ configured: false, source: "fallback", looks: instantFallback });

  const photo = typeof body.photoDataUrl === "string" && body.photoDataUrl.startsWith("data:image/") ? body.photoDataUrl : "";
  const prompt = `You are FITAI, a Gen-Z personal stylist in India. Create exactly 3 complete outfits. Style: ${p.style}. Occasion: ${p.occasion}. Fit: ${p.fit}. Colors: ${p.colors.join(", ") || "flexible"}. Maximum budget INR ${p.budget}. Each look must contain exactly one top, one bottom and one pair of shoes, with an optional accessory. No alternatives. Keep each look within budget. Return only JSON matching the supplied schema.`;
  const input = photo ? [{ role:"user", content:[{type:"input_text",text:prompt},{type:"input_image",image_url:photo}] }] : prompt;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method:"POST", headers:{"content-type":"application/json",authorization:`Bearer ${process.env.OPENAI_API_KEY}`}, signal:controller.signal,
      body:JSON.stringify({ model:MODEL, input, max_output_tokens:1000, text:{format:{type:"json_schema",name:"fitai_outfits",strict:true,schema}} })
    });
    clearTimeout(timer);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { console.error("FITAI OpenAI error", response.status, data); return json({configured:true,source:"fallback",looks:instantFallback,note:"AI unavailable; instant styling used."}); }
    const looks = normalize(parseJSON(outputText(data)), p);
    if (!looks) return json({configured:true,source:"fallback",looks:instantFallback,note:"AI response was incomplete; instant styling used."});
    return json({configured:true,source:"ai",looks});
  } catch (error) {
    clearTimeout(timer);
    console.error("FITAI AI request", error);
    return json({configured:true,source:"fallback",looks:instantFallback,note:"AI took too long; instant styling used."});
  }
}
