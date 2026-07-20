// ============================================================
// STARCLIP STUDIO — Serveur secret (Cloudflare Worker)
// Rôle : garder la clé fal.ai SECRÈTE, vérifier les codes
// clients, décompter les vidéos, relayer les demandes.
//
// À configurer dans Cloudflare (voir le pas-à-pas) :
//  - Secret  FAL_KEY   : ta clé fal.ai
//  - Secret  ADMIN_PIN : ton code PIN d'administrateur (ex: 245810)
//  - KV      CODES     : espace de stockage des codes clients
//
// v4 : ajout de /upload — héberge une image envoyée par le client
// sur le storage fal.ai, pour que fal-ai/any-llm/vision (analyse
// du visage de référence) puisse la lire via une vraie URL.
//
// v4.2 : le Multi-plans (storyboard multi_prompt, 2 plans ou plus)
// coûte désormais 2 vidéos au lieu de 1 — il consomme jusqu'à 15 s
// de génération, soit le coût studio de deux vidéos simples.
// Une génération à 1 seul plan reste à 1 vidéo.
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

// Génère un code lisible : STAR-XXXX (sans 0/O/1/I pour éviter les confusions)
function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "STAR-" + s;
}

// La clé est stockée dans le KV CODES (fiable, modifiable via un simple formulaire admin)
// plutôt que dans les "Secrets" Cloudflare, dont l'édition manuelle sur mobile s'est
// révélée peu fiable (doublons, valeurs mal collées).
async function getFalKey(env) {
  try {
    const kv = await env.CODES.get("__FAL_KEY__", "json");
    if (kv && typeof kv === "string" && kv.trim().length > 10) return kv.trim();
  } catch (e) {}
  return (env.FAL_KEY || "").trim(); // repli sur l'ancien Secret si présent
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ———————————— CLIENT : solde d'un code ————————————
      if (path === "/balance" && request.method === "POST") {
        const { code } = await request.json();
        const rec = await env.CODES.get((code || "").trim().toUpperCase(), "json");
        if (!rec) return json({ error: "Code inconnu. Vérifie-le ou commande-le sur WhatsApp." }, 404);
        return json({ ok: true, left: rec.left, total: rec.total });
      }

      // (v4.1 : l'endpoint /upload a été retiré — les photos de référence visage
      //  partent désormais en base64 directement dans la requête d'analyse,
      //  ce qui est officiellement supporté par l'API. Moins de code = moins de pannes.)

      // ———————————— CLIENT : lancer une création ————————————
      if (path === "/gen" && request.method === "POST") {
        const { code, path: modelPath, payload } = await request.json();
        const c = (code || "").trim().toUpperCase();
        const rec = await env.CODES.get(c, "json");
        if (!rec) return json({ error: "Code inconnu. Commande ton code sur WhatsApp." }, 403);

        // Seules les générations/retouches vidéo consomment des crédits ;
        // les compagnons (tenue, lip-sync, coupe, assistant, analyse visage) sont inclus.
        const isVideoGen = /(image-to-video|reference-to-video|video-to-video\/edit)/.test(modelPath || "");
        // Multi-plans (storyboard de 2 plans ou plus) = 2 vidéos, sinon 1.
        const isMultiShot = Array.isArray(payload && payload.multi_prompt) && payload.multi_prompt.length >= 2;
        const cost = isVideoGen ? (isMultiShot ? 2 : 1) : 0;
        if (isVideoGen && rec.left <= 0)
          return json({ error: "Plus de vidéos sur ce code (" + rec.total + " utilisées). Commande un nouveau code sur WhatsApp !" }, 402);
        if (isVideoGen && rec.left < cost)
          return json({ error: "Le Multi-plans coûte 2 vidéos et il ne reste que " + rec.left + " vidéo sur ce code. Fais une vidéo simple, ou commande un nouveau code sur WhatsApp !" }, 402);

        // Sécurité : uniquement les modèles autorisés
        const allowed = /^fal-ai\/(kling-video|nano-banana|workflow-utilities|any-llm)/.test(modelPath || "") || modelPath === "openrouter/router/vision";
        if (!allowed) return json({ error: "Modèle non autorisé." }, 400);

        const falKey = await getFalKey(env);
        const r = await fetch("https://queue.fal.run/" + modelPath, {
          method: "POST",
          headers: { "Authorization": "Key " + falKey, "Content-Type": "application/json" },
          body: JSON.stringify(payload || {}),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return json({ error: "Le studio de rendu a refusé (" + r.status + ") : " + JSON.stringify(data).slice(0, 160) }, 502);

        if (isVideoGen) {
          rec.left -= cost;
          rec.used = (rec.used || 0) + cost;
          rec.lastUse = Date.now();
          await env.CODES.put(c, JSON.stringify(rec));
        }
        return json({ ...data, left: rec.left, cost });
      }

      // ———————————— CLIENT : suivre / récupérer une création ————————————
      if (path === "/poll" && request.method === "POST") {
        const { code, url: qUrl } = await request.json();
        const rec = await env.CODES.get((code || "").trim().toUpperCase(), "json");
        if (!rec) return json({ error: "Code inconnu." }, 403);
        if (!/^https:\/\/queue\.fal\.run\//.test(qUrl || "")) return json({ error: "Adresse non autorisée." }, 400);
        const falKey = await getFalKey(env);
        const r = await fetch(qUrl, { headers: { "Authorization": "Key " + falKey } });
        const data = await r.json().catch(() => ({}));
        return json(data, r.ok ? 200 : 502);
      }

      // ———————————— ADMIN (Papy) : créer des codes ————————————
      if (path === "/admin/create" && request.method === "POST") {
        const { pin, videos, count } = await request.json();
        if (pin !== env.ADMIN_PIN) return json({ error: "PIN incorrect." }, 403);
        const n = Math.min(Math.max(parseInt(count) || 1, 1), 20);
        const v = Math.min(Math.max(parseInt(videos) || 1, 1), 100);
        const codes = [];
        for (let i = 0; i < n; i++) {
          let code = makeCode();
          while (await env.CODES.get(code)) code = makeCode(); // unicité
          await env.CODES.put(code, JSON.stringify({ left: v, total: v, used: 0, created: Date.now() }));
          codes.push(code);
        }
        return json({ ok: true, codes, videos: v });
      }

      // ———————————— ADMIN : lister les codes ————————————
      if (path === "/admin/list" && request.method === "POST") {
        const { pin } = await request.json();
        if (pin !== env.ADMIN_PIN) return json({ error: "PIN incorrect." }, 403);
        const list = await env.CODES.list({ limit: 200 });
        const out = [];
        for (const k of list.keys) {
          if (k.name.startsWith("__")) continue; // clés techniques (ex: __FAL_KEY__)
          const rec = await env.CODES.get(k.name, "json");
          if (rec && typeof rec === "object") out.push({ code: k.name, left: rec.left, total: rec.total, used: rec.used || 0 });
        }
        out.sort((a, b) => (b.left > 0 ? 1 : 0) - (a.left > 0 ? 1 : 0));
        return json({ ok: true, codes: out });
      }

      // ———————————— ADMIN : enregistrer la clé fal.ai (remplace les Secrets Cloudflare) ————————————
      if (path === "/admin/setkey" && request.method === "POST") {
        const { pin, key } = await request.json();
        if (pin !== env.ADMIN_PIN) return json({ error: "PIN incorrect." }, 403);
        const k = (key || "").trim();
        if (k.length < 20) return json({ error: "Cette clé semble trop courte — vérifie le collage." }, 400);
        await env.CODES.put("__FAL_KEY__", JSON.stringify(k));
        return json({ ok: true, longueur: k.length, debut: k.slice(0, 6) + "…" });
      }

      // ———————————— DIAGNOSTIC (proprietaire) : /selftest?pin=XXX ————————————
      if (path === "/selftest" && request.method === "GET") {
        const pin = url.searchParams.get("pin") || "";
        if (pin !== env.ADMIN_PIN) return json({ error: "PIN incorrect." }, 403);
        const falKey = await getFalKey(env);
        const keyInfo = falKey
          ? { presente: true, longueur: falKey.length, debut: falKey.slice(0, 6) + "…", source: (await env.CODES.get("__FAL_KEY__")) ? "KV (formulaire admin)" : "Secret Cloudflare" }
          : { presente: false };
        let falTest = {};
        try {
          const r = await fetch("https://queue.fal.run/fal-ai/any-llm", {
            method: "POST",
            headers: { "Authorization": "Key " + falKey, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "google/gemini-2.5-flash", prompt: "ping" }),
          });
          const t = await r.text();
          falTest = { statut_fal: r.status, reponse_fal: t.slice(0, 200) };
        } catch (e) { falTest = { erreur_reseau: e.message }; }
        return json({ diagnostic: "StarClip", cle: keyInfo, test_fal: falTest });
      }

      return json({ ok: true, service: "StarClip Studio — serveur du studio", version: 4.2 });
    } catch (e) {
      return json({ error: "Erreur serveur : " + e.message }, 500);
    }
  },
};
